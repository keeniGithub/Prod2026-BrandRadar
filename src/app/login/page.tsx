"use client"

import { ChangeEvent, FormEvent, useState } from "react"
import Image from "next/image";
import { Input } from "@/components/ui/input"
import {
  Field,
    FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FormErrors, FormValues, USERNAME_REGEX } from "../config/auth";
import { pages } from "../config/pages";
import { useCheckAuth } from "@/components/check-auth";
import { auth } from "../api/auth";
import toast from "react-hot-toast";

export default function Auth() {
    const router = useRouter()
    const [values, setValues] = useState<FormValues>({ username: "test", password: "testtest" })
    const [errors, setErrors] = useState<FormErrors>({})

    useCheckAuth()

    const validate = ({ username, password }: FormValues): FormErrors => {
        const trimmedUsername = username.trim()

        return {
            username:
                trimmedUsername.length < 3 || trimmedUsername.length > 15
                    ? "Юзернейм должен быть от 3 до 15 символов"
                    : !USERNAME_REGEX.test(trimmedUsername)
                    ? "Юзернейм может содержать только a-z, A-Z, 0-9 и _"
                    : undefined,
            password:
                !password.trim()
                    ? "Пароль не должен быть пустым"
                    : password.trim().length < 8
                    ? "Пароль должен содержать минимум 8 символов"
                    : undefined,
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const nextErrors = validate(values)
        if (nextErrors.username || nextErrors.password) {
            setErrors(nextErrors)
            return
        }

        setErrors({})

        const response = await auth({ username: values.username, password: values.password })

        if (response.status >= 200 && response.status < 300 && typeof response.data === "object" && response.data !== null && "access_token" in response.data) {
            localStorage.setItem("token", response.data.access_token)
            router.push(pages.DASHBOARD.ROOT)
            toast.success("Успешная авторизация")
        } else if (response.status == 401) {
            toast.error("Неверный логин или пароль")
        } else {
            toast.error("Ошибка авторизации")
        }
    }

    const handleChange =
        (field: keyof FormValues) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target

            setValues((prev) => ({ ...prev, [field]: value }))
            setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
        }

  return (
        <main className="flex items-center justify-center min-h-screen px-4 bg-[#e8f2ec]">
            <section className="flex justify-center items-center flex-col border-2 p-4 rounded-lg w-full max-w-100 aspect-square bg-white">
                <Image src="/logo.png" width={300} height={30} alt="logo" className="mb-3"/>
                <p className="text-sm mb-6">Просто <b>нажмите кнопку</b> для входа</p>

                <form className="max-w-75 w-full" onSubmit={handleSubmit} noValidate>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="fieldgroup-name">Имя пользователя</FieldLabel>
                            <Input
                                id="fieldgroup-name"
                                value={values.username}
                                onChange={handleChange("username")}
                                aria-invalid={!!errors.username}
                            />
                            <FieldError>{errors.username}</FieldError>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="fieldgroup-password">Пароль</FieldLabel>
                            <Input
                                id="fieldgroup-password"
                                type="password"
                                value={values.password}
                                onChange={handleChange("password")}
                                aria-invalid={!!errors.password}
                            />
                            <FieldError>{errors.password}</FieldError>
                        </Field>
                        <Field orientation="horizontal" className="w-full">
                            <Button type="submit" className="w-full bg-[#4fd168] text-white hover:bg-[#47bf5f] hover:text-white">Войти</Button>
                        </Field>
                    </FieldGroup>
                </form>
            </section>
    </main>
  )
}
