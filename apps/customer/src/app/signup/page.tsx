"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
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

  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState<AddressInput>(INITIAL_ADDRESS);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [addressErrors, setAddressErrors] = useState<
    Partial<Record<keyof AddressInput, string>>
  >({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function syncRecipientDefaults(
    nextName: string,
    nextMobile: string,
    nextCode: string,
  ) {
    setAddress((prev) => ({
      ...prev,
      recipientName: prev.recipientName || nextName,
      phone: prev.phone || (nextMobile ? toE164Phone(nextCode, nextMobile) : ""),
    }));
  }

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
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

    setCreating(true);
    try {
      const authIdentifier = phoneToAuthIdentifier(e164);
      const cred = await createUserWithEmailAndPassword(
        firebaseAuth,
        authIdentifier,
        parsed.data.password,
      );

      await updateProfile(cred.user, {
        displayName: parsed.data.name.trim(),
      });

      await setDoc(doc(firestoreDb, "users", cred.user.uid), {
        name: parsed.data.name.trim(),
        phoneNumber: e164,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await saveCustomerAddress(cred.user.uid, {
        ...parsed.data.address,
        isDefault: true,
      });

      router.push("/");
    } catch (err) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      if (code === "auth/email-already-in-use") {
        setErrorMessage(
          "An account with this mobile number already exists. Please sign in with your password.",
        );
      } else if (code === "auth/weak-password") {
        setErrorMessage("Please choose a stronger password (at least 6 characters).");
      } else if (code === "auth/operation-not-allowed") {
        setErrorMessage(
          "Email/Password sign-in is not enabled in Firebase Console yet.",
        );
      } else {
        setErrorMessage(
          `Could not create account${code ? ` (${code})` : ""}. Please try again.`,
        );
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] pb-32 md:pb-12">
      <Navbar />
      <main id="main-content" className="py-6 sm:py-14">
        <Container className="max-w-2xl">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Salad Menu
          </Link>

          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] sm:p-9">
            <Badge tone="green" className="mb-3 gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Instant Account · No OTP Needed
            </Badge>

            <h1 className="font-serif text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
              Create your Healthy Foods account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Enter your mobile number, create a password, and save your first
              delivery address so you can order in seconds next time.
            </p>

            <form
              onSubmit={handleCreateAccount}
              noValidate
              className="mt-6 space-y-5"
            >
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
                    syncRecipientDefaults(
                      e.target.value,
                      mobileNumber,
                      countryCode,
                    );
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
                  Mobile Number
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

              <div className="border-t border-[var(--border-subtle)] pt-5">
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
                disabled={creating}
                className="w-full"
              >
                {creating
                  ? "Creating Account..."
                  : "Create Account & Save Address"}
              </Button>
            </form>

            <p className="mt-6 border-t border-[var(--border-subtle)] pt-5 text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{" "}
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
