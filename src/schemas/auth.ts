import z from "zod";
export const signUpSchema=z.object({
    email:z.string().email("Please enter a valid Email address"),
    password:z.string().min(10,"Password must be 10 characters long ")
})

export type SignUpFormValues=z.infer<typeof signUpSchema>;


export const logInSchema=z.object({
    email:z.string().email("Please enter a valid Email address"),
    password:z.string().min(1,"Password is required")
})

export type LogInFormValues=z.infer<typeof logInSchema>;
