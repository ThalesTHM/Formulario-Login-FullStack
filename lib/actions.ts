"use server";

import prisma from "./prisma";
import { checkIpTries, getIpOnActions, hashPass } from "./server-utils";
import { signupFormSchema } from "./validation";
import { z } from 'zod'

export const createUser = async (username: string, password: string) => {
    const userInput = {
        username: username as string,
        password: password as string
    }

    try{
        await signupFormSchema.parseAsync(userInput);
    } catch (error){
        if (error instanceof z.ZodError){
            return {
                success: false,
                error: "Invalid Inputs."
            }
        } 
        
        return {
            success: false,
            error: "An unexpected error happened."
        }
    }

    const hashedPassword = await hashPass(password);

    try{
        await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword
            }
        })
    } catch (error) {
        if (error instanceof Error){
            return {
                success: false,
                error: "User already exists."
            }
        }
    }

    if(!(await checkIpTries(null))){
        const ip = (await getIpOnActions()) as string;
        
        try{
            const ipTry = await prisma.ipTries.findFirst({
                where: {
                    ip: ip,
                }
            });

            await prisma.ipTries.update({
                where: {
                    id: ipTry?.id,
                },
                data: {
                    tries: 0,
                    lastTry: new Date(Date.now())
                }
            });
        } catch {
            return {
                success: false,
                error: "An unexpected error happened."
            }
        }
    }

    return {
        success: true,
        error: ""
    }
}

export const getCurrentTry = async () => {
    const ip = (await getIpOnActions()) as string;

    try{
        const ipTry = await prisma.ipTries.findFirst({
            where: {
                ip: ip,
            }
        });

        return {
            success: true, 
            response: {
                tries: ipTry?.tries,
                lastTry: ipTry?.lastTry
            },
            error: ""
        };
    } catch  {
        return {
            success: false,
            response: {},
            error: "An unexpected error happened."
        };
    }
}