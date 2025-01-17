import {create} from "zustand"

type AuthDialog = {
    isLoginOpen:boolean,
    isRegisterOpen:boolean,
    openLogin:()=>void;
    openRegister:()=>void;
    closeDialog:(value:boolean)=>void;
}

export const useAuthDialog = create<AuthDialog>((set)=>({
    isLoginOpen:false,
    isRegisterOpen:false,
    openLogin:()=>set({isLoginOpen:true}),
    openRegister:()=>set({isRegisterOpen:true}),
    closeDialog:(value)=>set({isLoginOpen:value,isRegisterOpen:value})
}))