"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  EmailAuthProvider,
  RecaptchaVerifier,
  linkWithCredential,
  signInWithPhoneNumber,
  signOut,
  updateProfile,
  type ConfirmationResult,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import {
  firebaseAuth,
  firestoreDb,
  phoneToAuthIdentifier,
  toE164Phone,
} from "@/lib/firebase";
import { saveCustomerAddress } from "@/lib/addresses";
import { SignupFormSchema, type AddressInput } from "@/types/domain";
import { AddressFormFields } from "@/components/addresses/AddressFormFields";
import { MobileTabBar } from "@/components/storefront/MobileTabBar";
import { Navbar } from "@/components/storefront/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const INITIAL_ADDRESS: AddressInput = {
  label: "Home",
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  postalCode: "",
  deliveryNotes: "",
  mapsUrl: "",
  isDefault: true,
};

export default function SignupPage() {
  const router = useRouter();
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState<AddressInput>(INITIAL_ADDRESS);

  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<
    Partial<Record<keyof AddressInput, string>>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    return () => {
      try {
        recaptchaVerifierRef.current?.clear();
      } catch {
        // Ignore cleanup errors
      }
      recaptchaVerifierRef.current = null;
    };
  }, []);

  function syncRecipientDefaults(nextName: string, nextMobile: string, nextCode: string) {
    setAddress((prev) => ({
      ...prev,
      recipientName: prev.recipientName || nextName,
      phone: prev.phone || (nextMobile ? toE164Phone(nextCode, nextMobile) : ""),
    }));
  }

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setAddressErrors({});

    const e164 = toE164Phone(countryCode, mobileNumber);
    const resolvedAddress: AddressInput = {
      ...address,
      recipientName: address.recipientName.trim() || name.trim(),
      phone: address.phone.trim() || e164,
      isDefault: true,
    };

    const parsed = SignupFormSchema.safeParse({
      name,
      countryCode,
      mobileNumber: mobileNumber.replace(/\D/g, ""),
      password,
      confirmPassword,
      address: resolvedAddress,
    });

    if (!parsed.success) {
      const nextFieldErrors: Record<string, string> = {};
      const nextAddrErrors: Partial<Record<keyof AddressInput, string>> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "address" && typeof issue.path[1] === "string") {
          nextAddrErrors[issue.path[1] as keyof AddressInput] = issue.message;
        } else if (typeof issue.path[0] === "string") {
          nextFieldErrors[issue.path[0]] = issue.message;
        }
      }
      setFieldErrors(nextFieldErrors);
      setAddressErrors(nextAddrErrors);
      return;
    }

    setAddress(parsed.data.address);
    setSendingOtp(true);

    try {
      if (!recaptchaContainerRef.current) {
        throw new Error("Verification container not ready.");
      }

      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // Ignore cleanup errors
        }
        recaptchaVerifierRef.current = null;
      }

      const verifier = new RecaptchaVerifier(
        firebaseAuth,
        recaptchaContainerRef.current,
        { size: "invisible" },
      );
      recaptchaVerifierRef.current = verifier;

      const result = await signInWithPhoneNumber(firebaseAuth, e164, verifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err) {
      try {
        recaptchaVerifierRef.current?.clear();
      } catch {
        // Ignore
      }
      recaptchaVerifierRef.current = null;

      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      if (code === "auth/invalid-phone-number") {
        setErrorMessage("Please enter a valid mobile number with country code.");
      } else if (code === "auth/too-many-requests") {
        setErrorMessage("Too many OTP attempts. Please wait a few minutes and retry.");
      } else if (code === "auth/quota-exceeded") {
        setErrorMessage(
          "Daily free SMS quota reached. Try again tomorrow or add a Blaze billing account.",
        );
      } else if (code === "auth/billing-not-enabled") {
        setErrorMessage(
          "Firebase requires a Blaze billing account to send real SMS in this region (or use a Test Phone Number in Firebase Console).",
        );
      } else if (code === "auth/unauthorized-domain") {
        setErrorMessage(
          "This domain is not authorized in Firebase Console → Authentication → Settings → Authorized domains.",
        );
      } else if (code === "auth/operation-not-allowed") {
        setErrorMessage(
          "Phone SMS is blocked by Firebase SMS region policy or plan. Check Authentication → Settings → SMS region policy.",
        );
      } else {
        setErrorMessage(
          `Could not send OTP${code ? ` (${code})` : ""}. Please refresh and try again.`,
        );
      }
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyAndCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!confirmationResult) {
      setErrorMessage("OTP session expired. Please request a new OTP.");
      setStep("details");
      return;
    }

    if (otp.trim().length !== 6) {
      setErrorMessage("Enter the 6-digit OTP code sent to your mobile.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const credential = await confirmationResult.confirm(otp.trim());
      const user = credential.user;
      const e164 = user.phoneNumber ?? toE164Phone(countryCode, mobileNumber);

      const alreadyHasPassword = user.providerData.some(
        (p) => p.providerId === "password",
      );
      if (alreadyHasPassword) {
        await signOut(firebaseAuth);
        setErrorMessage(
          "This mobile number already has a password account. Please sign in with your password instead.",
        );
        setStep("details");
        return;
      }

      const authIdentifier = phoneToAuthIdentifier(e164);
      const emailCred = EmailAuthProvider.credential(authIdentifier, password);

      await linkWithCredential(user, emailCred);
      await updateProfile(user, { displayName: name.trim() });

      await setDoc(doc(firestoreDb, "users", user.uid), {
        name: name.trim(),
        phoneNumber: e164,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await saveCustomerAddress(user.uid, {
        ...address,
        recipientName: address.recipientName.trim() || name.trim(),
        phone: address.phone.trim() || e164,
        isDefault: true,
      });

      router.push("/");
    } catch (err) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      if (code === "auth/invalid-verification-code") {
        setErrorMessage("Incorrect OTP code. Please check and try again.");
      } else if (code === "auth/credential-already-in-use") {
        await signOut(firebaseAuth);
        setErrorMessage(
          "This mobile number is already registered. Please sign in with your password.",
        );
      } else {
        setErrorMessage(
          "Could not finish creating your account. Please verify your OTP and retry.",
        );
      }
    } finally {
      setVerifyingOtp(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] pb-28 md:pb-12">
      <Navbar />
      <main id="main-content" className="py-6 sm:py-14">
        <Container className="max-w-2xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Salad Menu
          </Link>

          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] sm:p-9">
            <Badge tone="green" className="mb-3 gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              One-Time Mobile OTP Verification
            </Badge>

            <h1 className="font-serif text-3xl font-semibold text-[var(--text-primary)]">
              Create your Healthy Foods account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Verify your mobile number once with OTP, set a password, and save
              your delivery address. Every future login uses your mobile number
              and password—no OTP needed!
            </p>

            {step === "details" ? (
              <form onSubmit={handleSendOtp} noValidate className="mt-7 space-y-6">
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block text-sm font-semibold text-[var(--text-primary)]"
                  >
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      syncRecipientDefaults(e.target.value, mobileNumber, countryCode);
                    }}
                    placeholder="Ananya Sharma"
                    className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
                  />
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs font-medium text-[var(--danger)]">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="signup-mobile"
                    className="block text-sm font-semibold text-[var(--text-primary)]"
                  >
                    Mobile Number (Verified via OTP Once)
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <select
                      aria-label="Country code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 shrink-0 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-2.5 py-2.5 text-sm font-semibold text-[var(--text-primary)]"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                      <option value="+971">+971</option>
                    </select>
                    <input
                      id="signup-mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={mobileNumber}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setMobileNumber(digits);
                        syncRecipientDefaults(name, digits, countryCode);
                      }}
                      placeholder="9876543210"
                      className="min-w-0 flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
                    />
                  </div>
                  {fieldErrors.mobileNumber && (
                    <p className="mt-1 text-xs font-medium text-[var(--danger)]">
                      {fieldErrors.mobileNumber}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-sm font-semibold text-[var(--text-primary)]"
                    >
                      Create Password
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 pr-10 text-sm text-[var(--text-primary)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--text-muted)]"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-xs font-medium text-[var(--danger)]">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm"
                      className="block text-sm font-semibold text-[var(--text-primary)]"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="signup-confirm"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)]"
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="mt-1 text-xs font-medium text-[var(--danger)]">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-[var(--border-subtle)] pt-6">
                  <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)]">
                    Save Your Delivery Address
                  </h2>
                  <p className="mt-1 mb-4 text-xs text-[var(--text-muted)]">
                    Saved securely to your account so you can reuse it on every
                    future order.
                  </p>
                  <AddressFormFields
                    value={address}
                    onChange={setAddress}
                    errors={addressErrors}
                    idPrefix="signup-addr"
                    showDefaultCheckbox={false}
                  />
                </div>

                <div ref={recaptchaContainerRef} />

                {errorMessage && (
                  <p
                    className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-xs font-medium text-[var(--danger)]"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={sendingOtp}
                  className="w-full"
                >
                  {sendingOtp
                    ? "Sending Verification OTP..."
                    : "Send OTP & Verify Mobile"}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={handleVerifyAndCreate}
                noValidate
                className="mt-7 space-y-5"
              >
                <div className="rounded-2xl border border-[#b7dfc3] bg-[var(--bg-accent-soft)] p-4 text-sm text-[var(--text-primary)]">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2
                      className="h-4 w-4 text-[var(--accent-primary)]"
                      aria-hidden="true"
                    />
                    <span>
                      OTP sent to {toE164Phone(countryCode, mobileNumber)}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="signup-otp"
                    className="block text-sm font-semibold text-[var(--text-primary)]"
                  >
                    Enter 6-Digit OTP
                  </label>
                  <input
                    id="signup-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="mt-1.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.4em] text-[var(--text-primary)]"
                  />
                </div>

                {errorMessage && (
                  <p
                    className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-xs font-medium text-[var(--danger)]"
                    role="alert"
                  >
                    {errorMessage}
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={verifyingOtp}
                    className="flex-1"
                  >
                    {verifyingOtp
                      ? "Creating Account..."
                      : "Verify OTP & Save Account"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setStep("details");
                      setOtp("");
                      setErrorMessage(null);
                    }}
                  >
                    Change Number
                  </Button>
                </div>
              </form>
            )}

            <p className="mt-6 border-t border-[var(--border-subtle)] pt-5 text-center text-sm text-[var(--text-secondary)]">
              Already verified your mobile number?{" "}
              <Link
                href="/login"
                className="font-semibold text-[var(--accent-primary)] hover:underline"
              >
                Sign in with password
              </Link>
            </p>
          </div>
        </Container>
      </main>
      <MobileTabBar />
    </div>
  );
}
