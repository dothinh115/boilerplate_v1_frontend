import type { TLogin } from "~/utils/models/login.model";

export type TUser = {
  id: string;
  email: string;
  rootUser: boolean;
  role: number;
};
export default function useAuth() {
  //refreshToken lưu ở cookie, access lưu ở session
  const refreshToken = useCookie(REFRESH_TOKEN);
  const user = useState<TUser>("user");

  const getUser = async () => {
    try {
      const fetchUserResult: any = await useApi("/me");
      if (fetchUserResult.data) user.value = fetchUserResult.data[0];
      return user.value;
    } catch (error) {}
  };

  const login = async (data: TLogin) => {
    data = {
      ...data,
      clientId: await useFingerSprint(),
    };
    const result: any = await useApi("/login", {
      method: "POST",
      body: data,
    });
    refreshToken.value = result?.refreshToken;
    //lưu accessToken vào session
    sessionStorage.setItem(ACCESS_TOKEN, result?.accessToken);
    const fetchUser = await getUser();
    if (fetchUser) window.location.reload();
    return result;
  };

  const logout = async () => {
    sessionStorage.removeItem(ACCESS_TOKEN);
    refreshToken.value = null;
    try {
      await useApi("/logout", {
        method: "POST",
        body: {
          refreshToken: refreshToken.value,
        },
      });
    } catch (error: any) {
      console.log(error.data.message);
    } finally {
      window.location.reload();
    }
  };

  return { login, getUser, logout, user };
}
