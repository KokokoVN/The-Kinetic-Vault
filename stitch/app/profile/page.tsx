import { cookies } from "next/headers";
import { redirect } from "next/navigation";


import {
  getUsernameFromAccessToken,
  getUserIdFromAccessToken,
  isAccessTokenExpired

} from "@/lib/auth";


import {
  getAdminUserProfile
} from "@/lib/api";


import {
  StorefrontLayout
} from "@/components/storefront-layout";


import {
  ProfileDashboard
} from "@/components/profile-dashboard";





export const dynamic =
  "force-dynamic";





export default async function ProfilePage() {


  const cookie =
    await cookies();



  const token =
    cookie.get("accessToken")
      ?.value;



  if (
    !token ||
    isAccessTokenExpired(token)

  ) {

    redirect(
      "/login?next=/profile"
    )

  }





  const userId =
    Number(
      getUserIdFromAccessToken(token)
    );



  if (!userId) {

    redirect("/login")

  }




  const username =
    getUsernameFromAccessToken(token);





  const user =
    await getAdminUserProfile(
      userId,
      {
        accessToken: token
      }
    );





  const logs =
    user?.userDetails
      ?.changeLogs
    ??
    [];






  return (

    <StorefrontLayout

      isLoggedIn={true}

      username={username}

      activeMenu="profile"

    >


      <main
        className="
mx-auto
max-w-[1400px]
px-5
py-10
"
      >



        <ProfileDashboard

          user={user}

          logs={logs}

          accessToken={token}

          userId={userId}

        />



      </main>



    </StorefrontLayout>


  )


}