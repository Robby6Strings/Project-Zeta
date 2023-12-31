import { Cinnabun, Component, createSignal } from "cinnabun"
import { PublicUser } from "../../types/user"
import { AuthCallbackState } from "../../types/auth"

const isClient = Cinnabun.isClient

export const pathStore = createSignal(isClient ? window.location.pathname : "/")
if (isClient) {
  window.addEventListener("popstate", (e) => {
    pathStore.value = (e.target as Window)?.location.pathname ?? "/"
  })
}

const decodeCookie = (str: string) =>
  str
    .split(";")
    .map((v) => v.split("="))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
      return acc
    }, {} as Record<string, any>)

const getUserDataFromCookie = (): PublicUser | null => {
  if (!window.document.cookie) return null
  const { user } = decodeCookie(window.document.cookie)
  if (!user) return null
  const parsed = JSON.parse(user)
  return parsed ?? null
}

export const userStore = createSignal<PublicUser | null>(isClient ? getUserDataFromCookie() : null)
export const bodyStyle = createSignal("")
export const openModalCount = createSignal(0)
openModalCount.subscribe((count) => {
  if (!Cinnabun.isClient) return
  if (count > 0) {
    bodyStyle.value = "overflow-y: hidden;"
  } else {
    bodyStyle.value = ""
  }
})

//userStore.subscribe(console.log)

export const getUser = (self: Component) =>
  self.useRequestData<PublicUser | null>("data.user", userStore.value)

export const isAuthenticated = (self: Component) => !!getUser(self)
export const isNotAuthenticated = (self: Component) => !getUser(self)

export const authModalOpen = createSignal(false)
export const authModalState = createSignal({
  title: "",
  message: "",
  callbackState: {} as AuthCallbackState | undefined,
})

export const sidebarOpen = createSignal(false)
export const userDropdownOpen = createSignal(false)
