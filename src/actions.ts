"use server";
import { getIronSession } from "iron-session";
import { SessionData, defaultSession, sessionOptions } from "./lib";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

let username = "john";
let isPro = true;
let isBlocked = true;

export const getSession = async () => {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }
  //we must check it for each request
  // we must check the user in db - is he blocked?
  session.isBlocked = isBlocked;
  //check pro value in db because admin can cancel it
  session.isPro = isPro;
  return session;
};
export const login = async (
  prevState: { error: undefined | string },
  formData: FormData
) => {
  const session = await getSession();
  const formUsername = formData.get("username") as string;
  const formPassword = formData.get("password") as string;
  // Check the username and password against your database or whatever you're using for authentication

  if (formUsername !== username) {
    return { error: " wrong credentials" };
  }

  session.userId = "1"; // must be id user from db
  session.userName = formUsername;
  session.isPro = isPro; // from db
  session.isLoggedIn = true;
  await session.save();
  redirect("/");
};
export const logout = async () => {
  const session = await getSession();
  session.destroy();
  redirect("/");
};
export const changePremium = async () => {
  const session = await getSession();
  //find in db user and update isPro for him
  isPro = !session.isPro;
  session.isPro = isPro; // session.ispro = isPro such as in db
  await session.save();
  revalidatePath("/profile");
};

export const changeUsername = async (formData: FormData) => {
  const session = await getSession();
  const newUsername = formData.get("username") as string;
  //find in db user and update isPro for him
  username = newUsername;

  session.userName = username; // session.ispro = isPro such as in db
  await session.save();
  revalidatePath("/profile");
};
