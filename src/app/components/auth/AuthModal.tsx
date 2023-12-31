import * as Cinnabun from "cinnabun"
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../modal/Modal"
import { authModalOpen, authModalState } from "../../state/global"
import { Button } from "../../components/Button"
import { GoogleIcon } from "../../components/icons/auth/GoogleIcon"
import { GithubIcon } from "../../components/icons/auth/GithubIcon"

const AuthModalProviderList = () => {
  const options = [
    {
      title: "Google",
      icon: GoogleIcon,
    },
    {
      title: "Github",
      icon: GithubIcon,
    },
  ]

  const handleOptionClick = (option: (typeof options)[0]) => {
    const callbackState = authModalState.value.callbackState
    const params = new URLSearchParams()
    if (callbackState) {
      for (const [key, value] of Object.entries(callbackState)) {
        if (typeof value === "undefined") continue
        params.append(key, value.toString())
      }
    }
    window.location.href = `/login/${option.title.toLowerCase()}?${params.toString()}`
  }

  return (
    <div className="flex gap flex-column">
      {options.map((option) => (
        <a
          href={`/login/${option.title.toLowerCase()}`}
          className="btn flex gap-sm p-3 auth-provider shadow"
          onclick={(e: Event) => {
            e.preventDefault()
            handleOptionClick(option)
          }}
        >
          <option.icon />
          <small>Continue with {option.title}</small>
        </a>
      ))}
    </div>
  )
}

export const AuthModal = () => {
  return (
    <Modal visible={authModalOpen} toggle={() => (authModalOpen.value = false)}>
      <ModalHeader>
        <h4 className="m-0">{() => authModalState.value.title}</h4>
      </ModalHeader>
      <ModalBody style="line-height:1.3rem">
        <small className="text-muted m-0">
          <i>{() => authModalState.value.message}</i>
        </small>
        <br />
        <br />
        <div>
          <AuthModalProviderList />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          className="btn btn-secondary hover-animate"
          onclick={() => (authModalOpen.value = false)}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}
