"server only";

import prisma from "./prisma";
import { RequestInternal } from "next-auth";
import { headers } from "next/headers";
import bcrypt from "bcrypt";

type AuthRequest = Pick<
  RequestInternal,
  "query" | "body" | "headers" | "method"
> & {
    socket?: {
      remoteAddress?: string
    }
};

const THIRTY_SECONDS = 30 * 1000

export const hashPass = (unHashPass: string) => {
    return bcrypt.hash(unHashPass, 10).then((hash: string) => {
        return hash;
    });
}

const getIp = (req: AuthRequest) => {
    const forwarded = (req.headers?.["x-forwarded-for"] as string) || "";
    const ip = forwarded ? forwarded.split(",")[0] : req.socket?.remoteAddress || "";

    return ip;
}

export const getIpOnActions = async () => {
    const headersList = await headers();
    const fwd = headersList.get("x-forwarded-for") || "";
    const ip = fwd.split(",")[0];

    return ip;
}

export const checkIpTries = async (req: AuthRequest | null) => {
    let ip
    
    if(req) 
        ip = getIp(req);
    else
        ip = await getIpOnActions();
    
    const ipTry = await prisma.ipTries.findFirst({
        where: {
            ip: ip,
        }
    });

    if (!ipTry) return true;

    const TIME_NOW = new Date(Date.now()).getTime();
    const LAST_TRY_TIME = ipTry?.lastTry.getTime() || 0;

    if ((TIME_NOW - LAST_TRY_TIME) > THIRTY_SECONDS) {
        try{
            await prisma.ipTries.update({
                where: {
                    id: ipTry.id,
                },
                data: {
                    tries: 0,
                    lastTry: ipTry?.lastTry
                }
            });
        } catch {
            return false;
        }

        return true;
    }

    if (ipTry?.tries >= 3) return false;
    
    return true;
}

export const addIpTry = async (req: AuthRequest) => {
    const ip = getIp(req);

    const ipTry = await prisma.ipTries.findFirst({
        where: {
            ip: ip,
        }
    });

    try {
        if (!ipTry) {
            await prisma.ipTries.create({
                data: {
                    ip: ip as string,
                    tries: 1,
                    lastTry: new Date(Date.now())
                }
            });
        } else {
            const tries = ipTry.tries;

            await prisma.ipTries.update({
                where: {
                    id: ipTry.id,
                },
                data: {
                    tries: ipTry.tries + 1,
                    lastTry: tries > 3 ? ipTry.lastTry : new Date(Date.now())
                }
            });
        }
    } catch {
        return false;
    }

    return true;
}