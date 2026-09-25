import { createUser, loginUser, updateUser } from "../../useApi/index.js"
import { localDB } from "../../lib/localDB.js"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function sanitizeUser(user = {}) {
  return {
    id: user.id,
    name: String(user.name || user.nome || "").trim(),
    email: String(user.email || user.emailUser || "").trim(),
  }
}

function getApiError(error, fallback) {
  const data = error?.response?.data
  const message = [
    data?.ErrorMessage,
    data?.errorMessage,
    data?.ErroMessage,
    data?.message,
    data?.error?.message,
    data?.Error?.message,
  ].find(value => typeof value === "string" && value.trim())
  return message || fallback
}

export default {
  data() {
    return {
      loginForm: { email: "", password: "" },
      loggingIn: false,
      loginError: "",
      registerForm: { nome: "", emailUser: "", password: "" },
      registering: false,
      registerSuccess: "",
      registerError: "",
      profileForm: { name: "", email: "" },
      savingProfile: false,
      profileSuccess: "",
      profileError: "",

      init() {
        this.syncProfileForm()
        this.$watch("$store.auth.user", user => this.syncProfileForm(user))
      },

      syncProfileForm(user = this.$store.auth.user) {
        if (!user) return
        this.profileForm.name = user.name || ""
        this.profileForm.email = user.email || ""
      },

      async entrar() {
        this.loginError = ""

        const email = this.loginForm.email.trim().toLowerCase()
        const password = this.loginForm.password
        if (!email) {
          this.loginError = "Informe seu e-mail."
          return false
        }
        if (!EMAIL_REGEX.test(email)) {
          this.loginError = "Informe um e-mail válido."
          return false
        }
        if (!password) {
          this.loginError = "Informe sua senha."
          return false
        }

        this.loggingIn = true
        try {
          const { data } = await loginUser({ email, password })
          const user = sanitizeUser(data?.userLogin)
          const token = data?.token
          if (!user.id || !user.name || !user.email || !token) {
            throw new Error("Resposta de login inválida")
          }

          this.$store.auth.user = user
          this.$store.auth.token = token
          this.$store.auth.authenticated = true
          localDB.setSession({ user, token })
          this.loginForm.email = ""
          this.loginForm.password = ""
          this.$store.toasts.push(`Bem-vindo de volta, ${user.name}!`, "success")
          return true
        } catch (err) {
          this.loginError = getApiError(
            err,
            "Erro ao fazer login. Verifique o e-mail, a senha e a conexão."
          )
          this.$store.toasts.push(this.loginError, "error")
          return false
        } finally {
          this.loggingIn = false
        }
      },

      async cadastrar() {
        this.registerSuccess = ""
        this.registerError = ""

        const nome = this.registerForm.nome.trim()
        const emailUser = this.registerForm.emailUser.trim().toLowerCase()
        const password = this.registerForm.password

        if (!nome || !emailUser || !password) {
          this.registerError = "Preencha nome, e-mail e senha."
          return
        }
        if (!EMAIL_REGEX.test(emailUser)) {
          this.registerError = "Informe um e-mail válido."
          return
        }
        if (password.length < 8) {
          this.registerError = "A senha deve ter pelo menos 8 caracteres."
          return
        }

        this.registering = true
        try {
          const { data } = await createUser({ nome, emailUser, password })
          this.registerSuccess = `Cadastro criado com sucesso para ${data?.user?.email || emailUser}!`
          this.$store.toasts.push(this.registerSuccess, "success")
          this.registerForm.nome = ""
          this.registerForm.emailUser = ""
          this.registerForm.password = ""
        } catch (err) {
          this.registerError = getApiError(
            err,
            "Erro ao criar cadastro. Verifique a conexão e tente novamente."
          )
          this.$store.toasts.push(this.registerError, "error")
        } finally {
          this.registering = false
        }
      },

      async salvarPerfil() {
        this.profileSuccess = ""
        this.profileError = ""

        const auth = this.$store.auth
        const name = this.profileForm.name.trim()
        const email = this.profileForm.email.trim().toLowerCase()

        if (!auth.user?.id || !auth.token) {
          this.profileError = "Sua sessão expirou. Entre novamente."
          return
        }
        if (!name || !email) {
          this.profileError = "Preencha nome e e-mail."
          return
        }
        if (!EMAIL_REGEX.test(email)) {
          this.profileError = "Informe um e-mail válido."
          return
        }

        this.savingProfile = true
        try {
          const { data } = await updateUser(auth.user.id, { name, email })
          const user = sanitizeUser(data?.user || { ...auth.user, name, email })
          auth.user = user
          localDB.setSession({ user, token: auth.token })
          this.profileSuccess = "Dados atualizados com sucesso."
          this.$store.toasts.push(this.profileSuccess, "success")
        } catch (err) {
          this.profileError = getApiError(
            err,
            "Erro ao atualizar os dados. Tente novamente mais tarde."
          )
          this.$store.toasts.push(this.profileError, "error")
        } finally {
          this.savingProfile = false
        }
      },
    }
  },
}
