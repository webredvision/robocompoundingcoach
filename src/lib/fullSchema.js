import { z } from 'zod';
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const registrationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email_id: z.string().email("Invalid email address"),
    mobile_number: z.string().min(10, "Mobile number is required"),
    pan_number: z.string().min(10, "PAN number is required"),
    dob: z.date({ required_error: "Date of Birth is required" }),
    otp: z.string().optional(), // validated only after OTP is sent
});

const contactSchema = z.object({
    contact_number: z.string().min(10, "Contact number is required"),
    contact_type: z.string(),
    extension: z.string().optional(),
    country_code: z.string(),
    whose_contact_number: z.string(),
    email_address: z.string().email("Invalid email"),
    whose_email_address: z.string(),
    fax_no: z.string().optional(),
});

const personSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Last name is required"),
    dob: z.string().min(1, "DOB is required"),
});

const identifierSchema = z.object({
    identifier_number: z.string().min(10, "PAN is required")
});

const holderSchema = z.object({
    holder_rank: z.string(),
    occ_code: z.string(),
    auth_mode: z.string(),
    is_pan_exempt: z.boolean(),
    pan_exempt_category: z.string(),
    kyc_type: z.enum(["K", "C", "B", "E"]),
    ckyc_number: z.string().optional(),
    person: personSchema,
    contact: z.array(contactSchema),
    identifier: z.array(identifierSchema)
}).superRefine((holder, ctx) => {
    if (holder.kyc_type === 'C' || holder.kyc_type === 'JO') {
        if (!holder.ckyc_number || holder.ckyc_number.length < 14) {
            ctx.addIssue({
                path: ['ckyc_number'],
                code: z.ZodIssueCode.custom,
                message: 'CKYC Number is required and must be at least 14 digits'
            });
        }
    }
});


export const step1Schema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, 'Last name is required'),
    dob: z.string().min(1, 'Date of Birth is required'),
    email_address: z.string().email('Invalid email'),
    gender: z.string().min(1, 'Please Select Gender'),
    contact_number: z
        .string()
        .min(10, 'Contact number must be at least 10 digits')
        .max(10, 'Contact number must be exactly 10 digits')
        .regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
});

export const step2Schema = z.object({
    holding_nature: z.string().min(1, 'Holding Nature is required'),
    holder: z.array(holderSchema)
});

export const step3Schema = z.object({
    occ_code: z.string().min(1, "Occupation is required"),
    tax_code: z.string().min(1, "Tax status is required"),
    pan: z.string().optional().refine(val => {
        if (!val) return true;
        return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val);
    }, {
        message: "Invalid PAN format"
    }),
    guardian_first_name: z.string().optional(),
    guardian_last_name: z.string().optional(),
    guardian_dob: z.string().optional(),
    guardian_pan: z.string().optional(),
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalcode: z.string().optional(),
}).superRefine((data, ctx) => {
    const needsGuardian = ["02", "42", "26", "28"].includes(data.tax_code);
    if (needsGuardian) {
        if (!data.guardian_first_name) {
            ctx.addIssue({
                path: ["guardian_first_name"],
                code: z.ZodIssueCode.custom,
                message: "Guardian First Name is required",
            });
        }
        if (!data.guardian_last_name) {
            ctx.addIssue({
                path: ["guardian_last_name"],
                code: z.ZodIssueCode.custom,
                message: "Guardian Last Name is required",
            });
        }
        if (!data.guardian_dob) {
            ctx.addIssue({
                path: ["guardian_dob"],
                code: z.ZodIssueCode.custom,
                message: "Guardian DOB is required",
            });
        }
        if (!data.guardian_pan) {
            ctx.addIssue({
                path: ["guardian_pan"],
                code: z.ZodIssueCode.custom,
                message: "Guardian PAN is required",
            });
        }
    }
    const needsForeign = !["01", "02"].includes(data.tax_code);
    if (needsForeign) {
        if (!data.address_line_1) {
            ctx.addIssue({
                path: ["address_line_1"],
                code: z.ZodIssueCode.custom,
                message: "Address Line 1 is required",
            });
        }
        if (!data.city) {
            ctx.addIssue({
                path: ["city"],
                code: z.ZodIssueCode.custom,
                message: "City is required",
            });
        }
        if (!data.state) {
            ctx.addIssue({
                path: ["state"],
                code: z.ZodIssueCode.custom,
                message: "State is required",
            });
        }
        if (!data.country) {
            ctx.addIssue({
                path: ["country"],
                code: z.ZodIssueCode.custom,
                message: "Country is required",
            });
        }
        if (!data.postalcode) {
            ctx.addIssue({
                path: ["postalcode"],
                code: z.ZodIssueCode.custom,
                message: "Postal Code is required",
            });
        }
    }
});

export const step4Schema = z
    .object({
        address_line_1: z.string().min(1, "Address Line 1 is required"),
        address_line_2: z.string().optional(),
        address_line_3: z.string().optional(),
        postalcode: z.string().min(1, "Postal Code is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        country: z.string().min(1, "Country is required"),
        address_type: z.string().min(1, "Address Type is required"),
        is_nomination_opted: z.boolean(),

        nomination: z
            .array(
                z.object({
                    person: z.object({
                        first_name: z.string().min(1, "First name is required"),
                        middle_name: z.string().optional(),
                        last_name: z.string().min(1, "Last name is required"),
                        dob: z.string().min(1, "Date of Birth is required"),
                        gender: z.string().min(1, "Gender is required"),
                    }),
                    nomination_relation: z.string().min(1, "Relationship is required"),

                    identifier: z
                        .array(
                            z.object({
                                identifier_type: z.string().optional(),
                                identifier_number: z.string().optional(),
                            })
                        )
                        .optional(), // Conditionally validated below

                    is_minor: z.boolean(),
                    pan: z.string().optional().refine(val => {
                        if (!val) return true;
                        return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val);
                    }, {
                        message: "Invalid PAN format"
                    }),
                    is_pan_exempt: z.boolean(),
                    pan_exempt_category: z.string().optional(),

                    guardian: z
                        .object({
                            first_name: z.string().optional(),
                            dob: z.string().optional(),
                        })
                        .optional(),
                })
            )
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (data.is_nomination_opted) {
            if (!data.nomination || data.nomination.length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Nominee details are required",
                    path: ["nomination"],
                });
            } else {
                const nominee = data.nomination[0];
                if (nominee.is_minor) {
                    if (!nominee.guardian?.first_name?.trim()) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Guardian name is required for minor nominee",
                            path: ["nomination", 0, "guardian", "first_name"],
                        });
                    }
                    if (!nominee.guardian?.dob?.trim()) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Guardian DOB is required for minor nominee",
                            path: ["nomination", 0, "guardian", "dob"],
                        });
                    }
                }
                if (!nominee.is_minor) {
                    if (!nominee.identifier || nominee.identifier.length === 0) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "At least one identifier is required",
                            path: ["nomination", 0, "identifier"],
                        });
                    } else {
                        const id = nominee.identifier[0];
                        if (!id.identifier_type?.trim()) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: "ID Type is required",
                                path: ["nomination", 0, "identifier", 0, "identifier_type"],
                            });
                        }
                        if (!id.identifier_number?.trim()) {
                            ctx.addIssue({
                                code: z.ZodIssueCode.custom,
                                message: "ID Number is required",
                                path: ["nomination", 0, "identifier", 0, "identifier_number"],
                            });
                        }
                    }
                }
            }
        }
    });



export const step5Schema = z.object({
    annual_income: z.string().min(1, "Annual Income is required"),
    source_wealth: z.string().min(1, "Source of Wealth is required"),
    politically_exposed: z.string().min(1, "Politically Exposed is required"),
    place_of_birth: z.string().min(1, "Birth Place is required"),
});

export const step6Schema = z.object({
    bank_acc_num: z.string().min(1, "Bank Account Number is required"),
    bank_name: z.string().optional(),
    ifsc_code: z
        .string()
        .min(1, "IFSC Code is required")
        .regex(
            /^[A-Z]{4}0[A-Z0-9]{6}$/,
            "Invalid IFSC format (e.g., AAAA0001234)"
        ),
    bank_acc_type: z.string().min(1, "Account Type is required"),
});

export const step7Schema = z.object({
  declaration_agreed: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to the terms and conditions.",
    }),
  }),
});


export const fullSchema = z.object({
    data: z.object({
        holder: z.array(z.object({
            person: z.object({
                first_name: z.string().min(1, 'First name is required'),
                middle_name: z.string().optional(),
                last_name: z.string().min(1, 'Last name is required'),
                dob: z.string().min(1, 'DOB is required'),
                gender: z.string().min(1, 'Gender is required'),
            }),
            identifier: z.array(z.object({
                identifier_type: z.string(),
                identifier_number: z.string().min(1, 'PAN is required'),
            })),
            contact: z.array(z.object({
                email_address: z.string().email('Invalid email'),
                contact_number: z.string().min(10, 'Phone number is required'),
            })),
        })),
    }),
});
