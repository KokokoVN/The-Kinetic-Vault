import { getApiBaseUrl } from "@/lib/profile-base";

export type UserAddress = {
  id?: number | null;
  recipientName?: string | null;
  provinceCode?: string | null;
  provinceName?: string | null;
  wardCode?: string | null;
  wardName?: string | null;
  streetLine?: string | null;
  fullAddress?: string | null;
  phoneNumber?: string | null;
  isDefault?: boolean | null;
};

export type UserLoginDevice = {
  id?: number | null;
  deviceFingerprint?: string | null;
  deviceLabel?: string | null;
  lastLoginIp?: string | null;
  lastLoginLocation?: string | null;
  lastLoginTimezone?: string | null;
  lastLoginLocale?: string | null;
  lastSeenAt?: string | null;
};

function authHeaders(accessToken?: string | null): Record<string,string>{

  const headers:Record<string,string> = {};

  const token = accessToken?.trim();

  if(token){
    headers.Authorization = `Bearer ${token}`;
  }


  return headers;

}






// ================= PROFILE =================

export async function checkEmailExists(email: string, accessToken?: string): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/accounts/users/check-email?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.exists;
  } catch {
    return false;
  }
}


export type ProfileUpdatePayload = {

  firstName:string;

  lastName:string;

  phoneNumber:string;

  gender:string;

  birthDate:string;

};





export type PasswordChangePayload = {

  currentPassword:string;

  newPassword:string;

  performedBy?:string;

};






export type EmailOtpPayload = {

  oldEmail?:string;

  newEmail:string;

  performedBy?:string;

};






export type VerifyEmailOtpPayload = {

  otp:string;

  newEmail?:string;

  performedBy?:string;

};







function apiUrl(path:string){

  const base = getApiBaseUrl();

  const p =
    path.startsWith("/")
    ? path
    : `/${path}`;


  return `${base}${p}`;

}








async function parseJsonSafe<T>(
res:Response
):Promise<T|null>{


 const text =
 await res.text();



 if(!text)
 return null;



 try{

   return JSON.parse(text) as T;

 }
 catch{

   return null;

 }


}









// ================= UPDATE PROFILE =================


export async function updateUserProfile(

 userId:number,

 payload:ProfileUpdatePayload,

 accessToken?:string|null

){


try{


const res =
await fetch(

apiUrl(
`/accounts/users/${userId}/profile`
),

{


method:"PUT",


headers:{


"Content-Type":"application/json",

...authHeaders(accessToken)


},


body:JSON.stringify({

firstName:
payload.firstName,


lastName:
payload.lastName,


phoneNumber:
payload.phoneNumber,


gender:
payload.gender,


birthDate:
payload.birthDate


}),


cache:"no-store"



}

);




if(!res.ok){


console.log(
"UPDATE PROFILE ERROR:",
res.status
);



console.log(
await res.text()
);



return null;


}





return await parseJsonSafe(res);



}
catch(error){


console.log(
"UPDATE PROFILE EXCEPTION",
error
);



return null;


}


}









// ================= EMAIL OTP =================



export async function requestEmailOtp(
  userId: number,
  newEmail: string,
  accessToken: string,
  oldEmail?: string
) {
  const response = await fetch(
    `${getApiBaseUrl()}/accounts/users/${userId}/email/otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        newEmail: newEmail.trim(),
        oldEmail: oldEmail?.trim() || undefined,
      }),
    }
  );

  return response.ok;
}

export async function resendEmailOtp(
  userId: number,
  accessToken: string,
  oldEmail?: string
) {
  const response = await fetch(
    `${getApiBaseUrl()}/accounts/users/${userId}/email/resend-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ oldEmail: oldEmail?.trim() || undefined }),
    }
  );

  return response.ok;
}









export async function verifyEmailOtp(
  userId: number,
  newEmail: string,
  otp: string,
  accessToken: string
) {
  const response = await fetch(
    `${getApiBaseUrl()}/accounts/users/${userId}/email/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        newEmail,
        otp,
      }),
    }
  );

  return response.ok;
}







export async function confirmEmailChange(
  userId: number,
  newEmail: string,
  otp: string,
  accessToken: string
) {
  const response = await fetch(
    `${getApiBaseUrl()}/accounts/users/${userId}/email/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        newEmail,
        otp,
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}








// ================= ADDRESS =================

export async function listUserAddresses(userId:number, accessToken?:string|null){
  try{
    const res = await fetch(apiUrl(`/accounts/users/${userId}/addresses`), { headers:{...authHeaders(accessToken)}, cache:"no-store" });
    if(!res.ok) return [] as UserAddress[];
    const data = await parseJsonSafe<UserAddress[]>(res);
    return data ?? [];
  }catch{ return []; }
}

export async function createUserAddress(userId:number, payload:Partial<UserAddress>, accessToken?:string|null){
  try{
    const res = await fetch(apiUrl(`/accounts/users/${userId}/addresses`), { method:"POST", headers:{"Content-Type":"application/json", ...authHeaders(accessToken)}, body:JSON.stringify(payload), cache:"no-store" });
    if(!res.ok) return null;
    return await parseJsonSafe<UserAddress>(res);
  }catch{ return null; }
}

export async function updateUserAddress(userId:number, addressId:number, payload:Partial<UserAddress>, accessToken?:string|null){
  try{
    const res = await fetch(apiUrl(`/accounts/users/${userId}/addresses/${addressId}`), { method:"PUT", headers:{"Content-Type":"application/json", ...authHeaders(accessToken)}, body:JSON.stringify(payload), cache:"no-store" });
    if(!res.ok) return null;
    return await parseJsonSafe<UserAddress>(res);
  }catch{ return null; }
}

export async function deleteUserAddress(userId:number, addressId:number, accessToken?:string|null){
  try{
    const res = await fetch(apiUrl(`/accounts/users/${userId}/addresses/${addressId}`), { method:"DELETE", headers:{...authHeaders(accessToken)}, cache:"no-store" });
    return res.ok;
  }catch{ return false; }
}

export async function setDefaultUserAddress(userId:number, addressId:number, accessToken?:string|null){
  try{
    const res = await fetch(apiUrl(`/accounts/users/${userId}/addresses/${addressId}/default`), { method:"PATCH", headers:{...authHeaders(accessToken)}, cache:"no-store" });
    if(!res.ok) return null;
    return await parseJsonSafe<UserAddress>(res);
  }catch{ return null; }
}

// ================= DEVICES =================

export async function listUserDevices(userId:number, accessToken?:string|null){
  try{
    const res = await fetch(apiUrl(`/accounts/users/${userId}/devices`), { headers:{...authHeaders(accessToken)}, cache:"no-store" });
    if(!res.ok) return [] as UserLoginDevice[];
    const data = await parseJsonSafe<UserLoginDevice[]>(res);
    return data ?? [];
  }catch{ return []; }
}

// ================= PASSWORD =================



export async function removeUserDevice(userId:number, deviceId:number, accessToken?:string|null){
  try{
    const res = await fetch(apiUrl(`/accounts/users/${userId}/devices/${deviceId}`), { method:"DELETE", headers:{...authHeaders(accessToken)}, cache:"no-store" });
    return res.ok;
  }catch{ return false; }
}

export async function changeUserPassword(

userId:number,

payload:PasswordChangePayload,

accessToken?:string|null

){


try{


const res =
await fetch(

apiUrl(
`/accounts/users/${userId}/password`
),


{


method:"PATCH",


headers:{


"Content-Type":"application/json",

...authHeaders(accessToken)


},


body:JSON.stringify(payload),


cache:"no-store"


}

);



if(!res.ok){


console.log(
"PASSWORD ERROR",
res.status
);


console.log(
await res.text()
);


}



return res.ok;



}
catch{


return false;


}

}









// ================= AVATAR =================



export async function uploadUserAvatar(

userId:number,

file:File,

accessToken?:string|null

):Promise<string|null>{


try{


const form =
new FormData();



form.append(
"file",
file
);





const res =
await fetch(

apiUrl(
`/accounts/users/${userId}/avatar`
),

{


method:"POST",


headers:{
...authHeaders(accessToken)
},


body:form,


cache:"no-store"


}

);





if(!res.ok)
return null;



const data =
await parseJsonSafe<{
avatarUrl?:string
}>(res);



return (
data?.avatarUrl?.trim()
||
null
);



}
catch{


return null;


}


}









export async function uploadUserAvatarWithActor(

userId:number,

file:File,

performedBy:string,

accessToken?:string|null

){


try{


const form =
new FormData();


form.append(
"file",
file
);



if(performedBy?.trim()){

form.append(
"performedBy",
performedBy.trim()
);

}





const res =
await fetch(

apiUrl(
`/accounts/users/${userId}/avatar`
),

{


method:"POST",


headers:{
...authHeaders(accessToken)
},


body:form,


cache:"no-store"


}

);





if(!res.ok)
return null;



const data =
await parseJsonSafe<{
avatarUrl?:string
}>(res);



return (
data?.avatarUrl?.trim()
||
null
);



}
catch{


return null;


}

}

export async function getVnProvinces(): Promise<any[]> {
  try {
    const res = await fetch("/api/vn-address?type=provinces", { cache: "force-cache" });
    if (!res.ok) {
      console.error("fetch provinces failed, status:", res.status);
      return [];
    }
    const data = await parseJsonSafe<{ rows?: any[] }>(res);
    return data?.rows ?? [];
  } catch (err) {
    console.error("fetch provinces exception:", err);
    return [];
  }
}

export async function getVnWards(provinceCode: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/vn-address?type=wards&provinceCode=${encodeURIComponent(provinceCode)}`, { cache: "force-cache" });
    if (!res.ok) {
      console.error("fetch wards failed, status:", res.status);
      return [];
    }
    const data = await parseJsonSafe<{ rows?: any[] }>(res);
    return data?.rows ?? [];
  } catch (err) {
    console.error("fetch wards exception:", err);
    return [];
  }
}

export async function verifyUserPassword(userId: number, currentPassword: string, accessToken?: string | null): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/accounts/users/${userId}/password/verify`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(accessToken)
      },
      body: JSON.stringify({ currentPassword }),
      cache: "no-store"
    });
    return res.ok;
  } catch {
    return false;
  }
}
export async function generate2fa(userId: number, accessToken?: string | null) {
  try {
    const res = await fetch(apiUrl(`/accounts/users/${userId}/2fa/generate`), {
      method: "POST",
      headers: authHeaders(accessToken),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function enable2fa(userId: number, code: string, accessToken?: string | null) {
  try {
    const res = await fetch(apiUrl(`/accounts/users/${userId}/2fa/enable`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(accessToken)
      },
      body: JSON.stringify({ code }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function disable2fa(userId: number, currentPassword: string, accessToken?: string | null) {
  try {
    const res = await fetch(apiUrl(`/accounts/users/${userId}/2fa/disable`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(accessToken)
      },
      body: JSON.stringify({ currentPassword }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
