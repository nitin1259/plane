import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
// hooks
import useInstance from "hooks/use-instance";
// ui
import { Button, TOAST_TYPE, getButtonStyling, setToast } from "@plane/ui";
// components
import {
  ConfirmDiscardModal,
  ControllerInput,
  CopyField,
  TControllerInputFormField,
  TCopyField,
} from "components/common";
// types
import {
  IFormattedInstanceConfiguration,
  TInstanceGithubAuthenticationConfigurationKeys,
} from "@plane/types";
// helpers
import { cn } from "helpers/common.helper";

type Props = {
  config: IFormattedInstanceConfiguration;
};

type GithubConfigFormValues = Record<
  TInstanceGithubAuthenticationConfigurationKeys,
  string
>;

export const InstanceGithubConfigForm: FC<Props> = (props) => {
  const { config } = props;
  // states
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] =
    useState(false);
  // store hooks
  const { updateInstanceConfigurations } = useInstance();
  // form data
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<GithubConfigFormValues>({
    defaultValues: {
      GITHUB_CLIENT_ID: config["GITHUB_CLIENT_ID"],
      GITHUB_CLIENT_SECRET: config["GITHUB_CLIENT_SECRET"],
    },
  });

  const originURL = typeof window !== "undefined" ? window.location.origin : "";

  const githubFormFields: TControllerInputFormField[] = [
    {
      key: "GITHUB_CLIENT_ID",
      type: "text",
      label: "Client ID",
      description: (
        <>
          You will get this from your{" "}
          <a
            href="https://github.com/settings/applications/new"
            target="_blank"
            className="text-custom-primary-100 hover:underline"
            rel="noreferrer"
          >
            GitHub OAuth application settings.
          </a>
        </>
      ),
      placeholder: "70a44354520df8bd9bcd",
      error: Boolean(errors.GITHUB_CLIENT_ID),
      required: true,
    },
    {
      key: "GITHUB_CLIENT_SECRET",
      type: "password",
      label: "Client secret",
      description: (
        <>
          Your client secret is also found in your{" "}
          <a
            href="https://github.com/settings/applications/new"
            target="_blank"
            className="text-custom-primary-100 hover:underline"
            rel="noreferrer"
          >
            GitHub OAuth application settings.
          </a>
        </>
      ),
      placeholder: "9b0050f94ec1b744e32ce79ea4ffacd40d4119cb",
      error: Boolean(errors.GITHUB_CLIENT_SECRET),
      required: true,
    },
  ];

  const githubCopyFields: TCopyField[] = [
    {
      key: "Origin_URL",
      label: "Origin URL",
      url: originURL,
      description: (
        <>
          We will auto-generate this. Paste this into the Authorized origin URL
          field{" "}
          <a
            href="https://github.com/settings/applications/new"
            target="_blank"
            className="text-custom-primary-100 hover:underline"
            rel="noreferrer"
          >
            here.
          </a>
        </>
      ),
    },
    {
      key: "Callback_URI",
      label: "Callback URI",
      url: `${originURL}/auth/github/callback/`,
      description: (
        <>
          We will auto-generate this. Paste this into your Authorized Callback
          URI field{" "}
          <a
            href="https://github.com/settings/applications/new"
            target="_blank"
            className="text-custom-primary-100 hover:underline"
            rel="noreferrer"
          >
            here.
          </a>
        </>
      ),
    },
  ];

  const onSubmit = async (formData: GithubConfigFormValues) => {
    const payload: Partial<GithubConfigFormValues> = { ...formData };

    await updateInstanceConfigurations(payload)
      .then(() => {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success",
          message: "Github Configuration Settings updated successfully",
        });
        reset();
      })
      .catch((err) => console.error(err));
  };

  const handleGoBack = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (isDirty) {
      e.preventDefault();
      setIsDiscardChangesModalOpen(true);
    }
  };

  return (
    <>
      <ConfirmDiscardModal
        isOpen={isDiscardChangesModalOpen}
        onDiscardHref="/authentication"
        handleClose={() => setIsDiscardChangesModalOpen(false)}
      />
      <div className="flex flex-col gap-8">
        <div className="flex w-full flex-col justify-between gap-x-12 gap-y-8 md:w-2/3 lg:w-1/2">
          {githubFormFields.map((field) => (
            <ControllerInput
              key={field.key}
              control={control}
              type={field.type}
              name={field.key}
              label={field.label}
              description={field.description}
              placeholder={field.placeholder}
              error={field.error}
              required={field.required}
            />
          ))}
          {githubCopyFields.map((field) => (
            <CopyField
              key={field.key}
              label={field.label}
              url={field.url}
              description={field.description}
            />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={!isDirty}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
            <Link
              href="/authentication"
              className={cn(
                getButtonStyling("link-neutral", "md"),
                "font-medium"
              )}
              onClick={handleGoBack}
            >
              Go back
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
