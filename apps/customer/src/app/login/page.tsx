"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import {
  firebaseAuth,
  phoneToAuthIdentifier,
  toE164Phone,
} from "@/lib/firebase";
import { PasswordLoginSchema } from "@/types/domain";
import { MobileTabBar } from "@/components/storefront/MobileTabBar";
import { Navbar } from "@/components/storefront/Navbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function LoginPage() {
  const router = useRouter();

  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const parsed = PasswordLoginSchema.safeParse({
      countryCode,
      mobileNumber: mobileNumber.replace(/\D/g, ""),
      password,
    });

    if (!parsed.success) {
      const errs = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        mobileNumber: errs.mobileNumber?.[0] ?? "",
        password: errs.password?.[0] ?? "",
      });
      return;
    }

    setLoading(true);
    try {
      const e164 = toE164Phone(parsed.data.countryCode, parsed.data.mobileNumber);
      const authIdentifier = phoneToAuthIdentifier(e164);
      await signInWithEmailAndPassword(firebaseAuth, authIdentifier, password);
      router.push("/");
    } catch (err) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: unknown }).code)
          : "";
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setErrorMessage(
          "Incorrect mobile number or password. New here? Create an account first.",
        );
      } else if (code === "auth/too-many-requests") {
        setErrorMessage("Too many failed attempts. Please wait a moment and try again.");
      } else {
        setErrorMessage("Unable to sign in right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] pb-32 md:pb-12">
      <Navbar />
      <main id="main-content" className="py-6 sm:py-14">
        <Container className="max-w-lg">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Salad Menu
          </Link>

          <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)] sm:p-9">
            <Badge tone="green" className="mb-3 gap-1.5">
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              Mobile + Password Sign In
            </Badge>

            <h1 className="font-serif text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Sign in with your mobile number and password to reuse your saved
              delivery addresses and track your bowls.
            </p>

            <form
              onSubmit={handlePasswordLogin}
              noValidate
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="login-mobile"
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
                    id="login-mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(e.target.value.replace(/\D/g, ""))
                    }
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

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-[var(--text-primary)]"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                disabled={loading}
                className="w-full"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 border-t border-[var(--border-subtle)] pt-5 text-center text-sm text-[var(--text-secondary)]">
              First time ordering?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[var(--accent-primary)] hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </Container>
      </main>
      <MobileTabBar />
    </div>
  );
}
