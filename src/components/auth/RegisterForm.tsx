import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { paths } from "@/routes/paths";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authErrorKey } from "../../auth/authError";
import { DEFAULT_COUNTRY_CODE, normalizePhoneNumber } from "../../utils/phone";
import { useAuth } from "../../auth/useAuth";
import { IMAGE_TYPES, MAX_IMAGE_MB, today } from "../../schemas/fields";
import {
  registerSchema,
  type RegisterFormValues,
} from "../../schemas/register.schema";
import { ErrorBanner } from "../common/ErrorBanner";
import SimpleSelect from "../common/SimpleSelect";
import FormField from "./FormField";
import PhoneField from "./PhoneField";

export default function RegisterForm() {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Where a guest was heading before being asked to sign up (see RequireAuth).
  const from = (
    location.state as { from?: { pathname: string; search?: string } } | null
  )?.from;
  const destination = from
    ? `${from.pathname}${from.search ?? ""}`
    : paths.profile;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    mode: "onTouched",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      countryCode: DEFAULT_COUNTRY_CODE,
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      gender: "0",
      dob: "",
      image: null,
    },
  });

  // Local preview of the picked picture (released when it changes).
  const image = useWatch({ control, name: "image" });
  const preview = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  );
  useEffect(
    () => () => (preview ? URL.revokeObjectURL(preview) : undefined),
    [preview],
  );

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      // The backend signs the user in on register, so go straight in.
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        countryCode: values.countryCode,
        phoneNumber: normalizePhoneNumber(values.phoneNumber),
        password: values.password,
        gender: Number(values.gender) as 0 | 1,
        dob: values.dob || undefined,
        image: values.image,
      });
      toast.success(t("toast.registered"));
      navigate(destination, { replace: true });
    } catch (error) {
      setServerError(authErrorKey(error));
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle role="heading" aria-level={1} className="text-2xl font-bold">
          {t("register.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <ErrorBanner message={serverError ? t(serverError as never) : null} />

          <Controller
            control={control}
            name="image"
            render={({ field, fieldState }) => (
              <div className="flex flex-col items-center gap-2">
                <label
                  htmlFor="image"
                  className="group relative grid size-24 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-primary/30 bg-sand text-primary transition hover:border-primary"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <Camera className="size-7" aria-hidden />
                  )}
                  <span className="sr-only">{t("register.image")}</span>
                </label>
                <input
                  id="image"
                  type="file"
                  accept={IMAGE_TYPES.join(",")}
                  className="sr-only"
                  aria-invalid={fieldState.error ? true : undefined}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  {t("register.imageHint", { mb: MAX_IMAGE_MB })}
                </p>
                {field.value && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() => field.onChange(null)}
                  >
                    {t("register.removeImage")}
                  </Button>
                )}
                {fieldState.error?.message && (
                  <p role="alert" className="text-sm text-destructive">
                    {t(fieldState.error.message as never, { mb: MAX_IMAGE_MB })}
                  </p>
                )}
              </div>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="firstName"
              autoComplete="given-name"
              label={t("register.firstName")}
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <FormField
              id="lastName"
              autoComplete="family-name"
              label={t("register.lastName")}
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>
          <FormField
            id="email"
            type="email"
            autoComplete="email"
            label={t("auth.email")}
            placeholder={t("auth.emailPlaceholder")}
            error={errors.email?.message}
            {...register("email")}
          />
          <Controller
            control={control}
            name="countryCode"
            render={({ field }) => (
              <PhoneField
                id="phoneNumber"
                label={t("register.phone")}
                countryCode={field.value}
                onCountryCodeChange={field.onChange}
                error={errors.phoneNumber?.message}
                {...register("phoneNumber")}
              />
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="gender">{t("register.gender")}</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <SimpleSelect
                    id="gender"
                    value={field.value}
                    onValueChange={field.onChange}
                    options={[
                      { value: "0", label: t("gender.male") },
                      { value: "1", label: t("gender.female") },
                    ]}
                  />
                )}
              />
            </div>
            <FormField
              id="dob"
              type="date"
              autoComplete="bday"
              min="1900-01-01"
              max={today()}
              label={t("register.dob")}
              error={errors.dob?.message}
              {...register("dob")}
            />
          </div>
          <FormField
            id="password"
            type="password"
            autoComplete="new-password"
            label={t("auth.password")}
            error={errors.password?.message}
            {...register("password")}
          />
          <FormField
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            label={t("register.confirmPassword")}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? t("register.submitting") : t("register.submit")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t("register.haveAccount")}{" "}
            <Link
              to={paths.login}
              state={location.state}
              className="font-medium text-primary hover:underline"
            >
              {t("register.loginLink")}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
