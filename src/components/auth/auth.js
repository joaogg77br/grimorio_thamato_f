import { createUser, loginUser, findAllUsers } from "../../useApi/index.js"
import { localDB } from "../../lib/localDB.js"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default {
  data() {
    return {
      loginForm: { usuario: "" },
      loggingIn: false,
      loginError: "",
      registerForm: { nome: "", emailUser: "" },
      registering: false,
      registerSuccess: "",
      registerError: "",

      async entrar() {
        this.loginError = ""

        const identificador = this.loginForm.usuario.trim()
        if (!identificador) {
          this.loginError = "Informe seu nome ou e-mail."
          return false
        }

        this.loggingIn = true
        try {
          await loginUser({ emailOrNickName: identificador })
          const user = await this.resolverUsuario(identificador)
          this.$store.auth.user = user
          this.$store.auth.authenticated = true
          localDB.setSession(user)
          this.loginForm.usuario = ""
          this.$store.toasts.push(`Bem-vindo de volta, ${user.name}!`, "success")
          return true
        } catch (err) {
          this.loginError =
            err?.response?.data?.ErrorMessage ||
            "Erro ao fazer login. Verifique a conexão e tente novamente."
          this.$store.toasts.push(this.loginError, "error")
          return false
        } finally {
          this.loggingIn = false
        }
      },

      async resolverUsuario(identificador) {
        try {
          const { data } = await findAllUsers()
          const alvo = identificador.toLowerCase()
          const found = data?.usersFind?.find(
            (u) =>
              u.email?.toLowerCase() === alvo ||
              u.name?.toLowerCase() === alvo
          )
          if (found) return { id: found.id, name: found.name }
        } catch {}
        return { id: crypto.randomUUID(), name: identificador }
      },

      async cadastrar() {
        this.registerSuccess = ""
        this.registerError = ""

        const nome = this.registerForm.nome.trim()
        const emailUser = this.registerForm.emailUser.trim()

        if (!nome || !emailUser) {
          this.registerError = "Preencha nome e e-mail."
          return
        }
        if (!EMAIL_REGEX.test(emailUser)) {
          this.registerError = "Informe um e-mail válido."
          return
        }

        this.registering = true
        try {
          const { data } = await createUser({ nome, emailUser })
          this.registerSuccess = `Cadastro criado com sucesso para ${data?.user?.email || emailUser}!`
          this.$store.toasts.push(this.registerSuccess, "success")
          this.registerForm.nome = ""
          this.registerForm.emailUser = ""
        } catch (err) {
          this.registerError =
            err?.response?.data?.errorMessage ||
            "Erro ao criar cadastro. Verifique a conexão e tente novamente."
          this.$store.toasts.push(this.registerError, "error")
        } finally {
          this.registering = false
        }
      },
    }
  },
}
