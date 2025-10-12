import { TextField as MuiTextField } from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";

const TextField = ({
  ref,
  inputRef,
  label,
  labelColor,
  fullWidth,
  variant,
  defaultValue,
  placeholder,
  color,
  backgroundColor,
  onChange,
  margin,
  borderRadius,
}: {
  ref?: React.RefObject<HTMLDivElement | null> | null | undefined;
  inputRef?: React.RefObject<HTMLInputElement | null> | null | undefined;
  label?: ReactNode;
  labelColor?: { focused: string; shrinked: string; unfocused: string };
  fullWidth?: boolean;
  variant?: "outlined" | "noOutline";
  defaultValue?: string;
  placeholder?: string | { useDefaultValue?: boolean };
  color?: string;
  backgroundColor?: string;
  onChange?:
    | React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    | undefined;
  margin?: "normal" | "dense" | "none";
  borderRadius?: string;
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  fullWidth ??= true;

  variant ??= "outlined";
  variant = variant === "noOutline" ? undefined : variant;

  margin ??= "none";

  borderRadius ??= "1rem";

  color ??= "white";
  backgroundColor ??= "rgb(from white r g b / 0.1)";
  labelColor ??= {
    focused: "primary.main",
    shrinked: "white",
    unfocused: "gray",
  };

  placeholder ??= { useDefaultValue: true };
  placeholder =
    typeof placeholder === "object"
      ? placeholder.useDefaultValue
        ? defaultValue
        : ""
      : placeholder;

  return (
    <MuiTextField
      ref={ref}
      inputRef={inputRef}
      fullWidth={fullWidth}
      label={label}
      variant={variant}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(event) => {
        setValue(event.target.value);
        onChange?.call(this, event);
      }}
      margin={margin}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: borderRadius,
          backgroundColor: backgroundColor,
          "& fieldset": {
            borderRadius: borderRadius,
          },
        },
        "& .MuiInputLabel-root": {
          color: labelColor.unfocused,
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: labelColor.focused,
        },
        "& .MuiInputLabel-shrink": {
          color: labelColor.shrinked,
        },
        input: { color: color },
      }}
    />
  );
};

export default TextField;
