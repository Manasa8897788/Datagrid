import type React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Avatar,
  IconButton,
  Chip,
  Radio,
  FormControlLabel,
  RadioGroup,
  Checkbox,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Phone,
  Email,
  Numbers,
} from "@mui/icons-material";
import { GridMaster } from "./models/gridMaster";

// Sample grid master data structure
// const gridMaster = {
//   gridColumns: [
//     {
//       id: "firstName",
//       label: "First Name",
//       formElementType: "text",
//       displayable: true,
//       required: true,
//       validation: {
//         minLength: 2,
//         maxLength: 50,
//       },
//     },
//     {
//       id: "lastName",
//       label: "Last Name",
//       formElementType: "text",
//       displayable: true,
//       required: true,
//       validation: {
//         minLength: 2,
//         maxLength: 50,
//       },
//     },
//     {
//       id: "email",
//       label: "Email Address",
//       formElementType: "email",
//       displayable: true,
//       required: true,
//       validation: {
//         pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//       },
//     },
//     {
//       id: "age",
//       label: "Age",
//       formElementType: "number",
//       displayable: true,
//       required: false,
//       validation: {
//         min: 18,
//         max: 100,
//         pattern: /^\d+$/,
//       },
//     },
//     {
//       id: "phone",
//       label: "Phone Number",
//       formElementType: "phone",
//       displayable: true,
//       required: true,
//       validation: {
//         pattern: /^\+?[\d\s\-$$$$]{10,}$/,
//       },
//     },
//     {
//       id: "profileImage",
//       label: "Profile Image",
//       formElementType: "image",
//       displayable: true,
//       required: false,
//       validation: {
//         maxSize: 5 * 1024 * 1024, // 5MB
//         allowedTypes: ["image/jpeg", "image/png", "image/gif"],
//       },
//     },
//     {
//       id: "gender",
//       label: "Gender",
//       formElementType: "select",
//       displayable: true,
//       required: false,
//       options: [
//         { value: "male", label: "Male" },
//         { value: "female", label: "Female" },
//         { value: "other", label: "Other" },
//       ],
//     },
//     {
//       id: "bio",
//       label: "Biography",
//       formElementType: "textarea",
//       displayable: true,
//       required: false,
//       validation: {
//         maxLength: 500,
//       },
//     },
//     {
//       id: "hiddenField",
//       label: "Hidden Field",
//       formElementType: "text",
//       displayable: false,
//       required: false,
//     },
//   ],
// };

interface FormData {
  [key: string]: any;
}

interface ValidationErrors {
  [key: string]: string;
}

interface DynamicFormProps {
  gridMaster: GridMaster;
  drawerData: any;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  gridMaster,
  drawerData,
}) => {
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [imagePreview, setImagePreview] = useState<{ [key: string]: string }>(
    {}
  );

  // Validation functions
  const validateField = useCallback((field: any, value: any): string => {
    if (
      field.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      return `${field.title} is required`;
    }

    if (!value) return "";

    const validation = field.validation || {};

    // Text validation
    if (
      field.formElementType === "text" ||
      field.formElementType === "textarea"
    ) {
      if (validation.minLength && value.length < validation.minLength) {
        return `${field.tile} must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `${field.title} must not exceed ${validation.maxLength} characters`;
      }
    }

    // Number validation
    if (field.formElementType === "number") {
      if (validation.pattern && !validation.pattern.test(value.toString())) {
        return `${field.title} must be a valid number`;
      }
      const numValue = Number.parseInt(value);
      if (validation.min && numValue < validation.min) {
        return `${field.title} must be at least ${validation.min}`;
      }
      if (validation.max && numValue > validation.max) {
        return `${field.title} must not exceed ${validation.max}`;
      }
    }

    // Email validation
    if (field.formElementType === "email") {
      if (validation.pattern && !validation.pattern.test(value)) {
        return `${field.title} must be a valid email address`;
      }
    }

    // Phone validation
    if (field.formElementType === "phone") {
      if (validation.pattern && !validation.pattern.test(value)) {
        return `${field.title} must be a valid phone number`;
      }
    }

    return "";
  }, []);
  // formating value of data
  const formatInitialValue = (type: string, value: any) => {
    if (!value) return "";

    const time = value.includes("T");
    if (type === "date" && time) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0]; // returns YYYY-MM-DD
      }
    }
    console.log("Datevalue", value);
    return value;
  };

  // Handle input changes
  const handleInputChange = useCallback(
    (fieldId: string, value: any, field: any) => {
      setFormData((prev) => ({
        ...prev,
        [fieldId]: value,
      }));

      // Validate field
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [fieldId]: error,
      }));
    },
    [validateField]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (fieldId: string, file: File, field: any) => {
      const validation = field.validation || {};

      // Validate file size
      if (validation.maxSize && file.size > validation.maxSize) {
        setErrors((prev) => ({
          ...prev,
          [fieldId]: `File size must not exceed ${
            validation.maxSize / (1024 * 1024)
          }MB`,
        }));
        return;
      }

      // Validate file type
      if (
        validation.allowedTypes &&
        !validation.allowedTypes.includes(file.type)
      ) {
        setErrors((prev) => ({
          ...prev,
          [fieldId]: `File type must be one of: ${validation.allowedTypes.join(
            ", "
          )}`,
        }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview((prev) => ({
          ...prev,
          [fieldId]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);

      // Update form data
      setFormData((prev) => ({
        ...prev,
        [fieldId]: file,
      }));

      // Clear errors
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "",
      }));
    },
    []
  );

  // Format phone number
  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
  };

  // Render form element based on type
  const renderFormElement = (field: any, initialValue: any) => {
    const fieldId = field.id;
    const value = formData[fieldId] || initialValue;
    const error = errors[fieldId];

    console.log("##value", value);

    const commonProps = {
      fullWidth: true,
      variant: "outlined" as const,

      error: !!error,
      helperText: error,
      required: field.required,
    };

    switch (field.formElementType) {
      case "text":
        return (
          <>
            <p>{field?.title}</p>
            <TextField
              {...commonProps}
              label={field?.label}
              value={value}
              onChange={(e) =>
                handleInputChange(fieldId, e.target.value, field)
              }
              InputProps={{}}
            />
          </>
        );

      case "email":
        return (
          <>
            <p>{field.title}</p>
            <TextField
              {...commonProps}
              // label={field.title}
              type="email"
              value={value}
              onChange={(e) =>
                handleInputChange(fieldId, e.target.value, field)
              }
              InputProps={{
                startAdornment: (
                  <Email sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </>
        );

      case "number":
        return (
          <>
            <p>{field.title}</p>
            <TextField
              {...commonProps}
              // label={field.title}
              type="number"
              value={value}
              onChange={(e) =>
                handleInputChange(fieldId, e.target.value, field)
              }
              InputProps={{
                startAdornment: (
                  <Numbers sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </>
        );

      case "checkbox":
        return (
          <>
            <p>{field.title}</p>
            <FormControl error={!!error} required={field.required}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value === true || value === "true" || value === 1}
                    onChange={(e) =>
                      handleInputChange(fieldId, e.target.checked, field)
                    }
                    sx={{ color: "primary.main" }}
                  />
                }
                label={field.title}
              />
              {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          </>
        );

      case "phone":
        return (
          <>
            <p>{field.title}</p>
            <TextField
              {...commonProps}
              // label={field.title}
              value={value}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                handleInputChange(fieldId, formatted, field);
              }}
              InputProps={{
                startAdornment: (
                  <Phone sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
              placeholder="(123) 456-7890"
            />

            {/* <PhoneInput
              enableSearch
              country={"in"}
              value={value}
              onChange={(value: string, data: any) => {
                const dialCode = data.dialCode;
                const localNumber = value.slice(dialCode.length);
                const formatted = `+${dialCode}-${localNumber}`;
                // setFormData((prev) => ({
                //   ...prev,
                //   address: {
                //     ...prev.address,
                //     phoneNumber: formatted,
                //   },
                // }));

                // const formatted = formatPhoneNumber(e.target.value);
                handleInputChange(fieldId, formatted, field);

                // Clear phone number error when user starts typing
                // if (errors.phoneNumber) {
                //   setErrors((prev) => {
                //     const newErrors = { ...prev };
                //     delete newErrors.phoneNumber;
                //     return newErrors;
                //   });
                // }
              }}
              inputProps={{
                name: "phoneNumber",
                required: true,
                className: `form-control custom-phone-address ${
                  errors.phoneNumber ? "is-invalid" : ""
                }`,
                id: "phoneNumber",
              }}
              inputStyle={{
                width: "100%",
              }}
              placeholder="Enter your phone number"
            /> */}
          </>
        );

      case "textarea":
        return (
          <>
            <p>{field.title}</p>
            <TextField
              {...commonProps}
              // label={field.title}
              multiline
              rows={4}
              value={value}
              onChange={(e) =>
                handleInputChange(fieldId, e.target.value, field)
              }
            />
          </>
        );

      case "select":
        return (
          <>
            <p>{field.title}</p>
            <FormControl fullWidth error={!!error} required={field.required}>
              <Select
                value={value}
                label={value}
                onChange={(e) =>
                  handleInputChange(fieldId, e.target.value, field)
                }
              >
                {field.enumValues?.map((option: any) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          </>
        );

      case "image":
        return (
          <>
            <p>{field.title}</p>
            <Box>
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: error ? "error.main" : "grey.300",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                  },
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(fieldId, file, field);
                    }
                  }}
                />
                {imagePreview[fieldId] ? (
                  <Box>
                    <Avatar
                      src={imagePreview[fieldId]}
                      sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
                    />
                    <Box
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Chip
                        label={formData[fieldId]?.name || "Image uploaded"}
                        color="success"
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          setFormData((prev) => ({ ...prev, [fieldId]: null }));
                          setImagePreview((prev) => ({
                            ...prev,
                            [fieldId]: "",
                          }));
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <CloudUpload
                      sx={{ fontSize: 48, color: "grey.400", mb: 2 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      Click to upload
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </Typography>
                  </Box>
                )}
              </Box>
              {error && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 1, display: "block" }}
                >
                  {error}
                </Typography>
              )}
            </Box>
          </>
        );
      case "date":
        return (
          <>
            <p>{field.title}</p>
            <TextField
              {...commonProps}
              // label={field.title}
              type="date"
              value={formatInitialValue(field.formElementType, value)}
              onChange={(e) =>
                handleInputChange(fieldId, e.target.value, field)
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </>
        );

      case "radio":
        return (
          <>
            <p>{field.title}</p>
            <FormControl
              component="fieldset"
              error={!!error}
              required={field.required}
            >
              <RadioGroup
                row
                value={value}
                onChange={(e) =>
                  handleInputChange(fieldId, e.target.value, field)
                }
              >
                {field.enumValues?.map((option: any) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
              {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
          </>
        );

      default:
        return (
          <>
            <p>{field.title}</p>
            <TextField
              {...commonProps}
              // label={field.title}
              value={value}
              onChange={(e) =>
                handleInputChange(fieldId, e.target.value, field)
              }
            />
          </>
        );
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: ValidationErrors = {};
    const displayableFields = gridMaster.gridColumns.filter(
      (field) => field.displayable
    );

    displayableFields.forEach((field) => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Form submitted successfully:", formData);
      alert("Form submitted successfully! Check console for data.");
    }
  };

  // Get displayable fields
  const displayableFields = gridMaster.gridColumns.filter(
    (field) => field.displayable
  );

  return (
    <Box
    //  sx={{ maxWidth: 800, mx: "auto", p: 3 }}
    >
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* <Typography variant="h4" gutterBottom align="center" color="primary">
          Dynamic Form Builder
        </Typography> */}

        {/* <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          sx={{ mb: 4 }}
        >
          Fill out the form below. All fields marked with * are required.
        </Typography> */}

        <form onSubmit={handleSubmit}>
          {displayableFields.map((field) => {
            console.log("##drawerData", drawerData);
            console.log("##field", field.code);

            const initialValue = drawerData[field.code];

            return (
              <Box key={field.id}>{renderFormElement(field, initialValue)}</Box>
            );
          })}

          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setFormData({});
                setErrors({});
                setImagePreview({});
              }}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ minWidth: 120 }}
            >
              Submit Form
            </Button>
          </Box>
        </form>

        {/* Debug info */}
        {/* <Box sx={{ mt: 4, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Form Data (Debug):
          </Typography>
          <pre style={{ fontSize: "12px", overflow: "auto" }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </Box> */}
      </Paper>
    </Box>
  );
};

export default DynamicForm;
