import { supabase } from "./supabase.js"

const formRegister = document.getElementById("form-register")
const formLogin = document.getElementById("form-login")
const logoutBtn = document.getElementById("logout-btn")

if (formRegister) {
  formRegister.addEventListener("submit", async (event) => {
    event.preventDefault()

    const values = new FormData(formRegister)
    const nama = String(values.get("nama") ?? "").trim()
    const kelas = String(values.get("kelas") ?? "").trim()
    const email = String(values.get("email") ?? "").trim()
    const password = String(values.get("password") ?? "")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            display_name: nama,
            kelas: kelas,
          },
        },
      })

      if (error) {
        const emailDigunakan =
          error.code === "user_already_exists" ||
          error.message.toLowerCase().includes("already registered")

        if (emailDigunakan) {
          alert("E-mail sudah digunakan.")
          return
        }

        alert(error.message)
        return
      }

      if (data.user && data.user.identities?.length === 0) {
        alert("E-mail sudah digunakan.")
        return
      }

      if (!data.user) {
        alert("Akun tidak berhasil dibuat. Silakan coba lagi.")
        return
      }

      if (!data.session) {
        alert("Akun berhasil dibuat, tetapi sesi signup tidak tersedia sehingga data siswa belum dapat disimpan. Periksa pengaturan konfirmasi email Supabase.")
        return
      }

      const { error: insertError } = await supabase.from("siswa").insert({
        user_id: data.user.id,
        nama,
        kelas,
        email,
      })

      if (insertError) {
        console.error("Gagal menyimpan data siswa:", insertError)
        const { error: signOutError } = await supabase.auth.signOut()
        alert(signOutError
          ? `Data siswa gagal disimpan: ${insertError.message}. Logout otomatis juga gagal: ${signOutError.message}`
          : `Akun berhasil dibuat, tetapi data siswa gagal disimpan: ${insertError.message}`)
        return
      }

      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        alert(`Data siswa berhasil disimpan, tetapi logout otomatis gagal: ${signOutError.message}`)
        return
      }

      formRegister.reset()
      alert("Akun dan data anda berhasil disimpan. Silakan login menggunakan email dan password.")
      gantiForm("login-form")
    }
    catch (error) {
      alert(`Pendaftaran gagal: ${error.message}`)
    }
  })
}

if (formLogin) {
  formLogin.addEventListener("submit", async (event) => {
    event.preventDefault()

    const values = new FormData(formLogin)
    const email = String(values.get("email") ?? "").trim()
    const password = String(values.get("password") ?? "")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(`Email atau password salah: ${error.message}`)
        formLogin.reset()
        return
      }

      window.location.assign("index.html")
    } catch (error) {
      alert(`Login gagal: ${error.message}`)
    }
  })
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault()

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        alert(`Logout gagal: ${error.message}`)
        return
      }

      window.location.replace("login.html")
    } catch (error) {
      alert(`Logout gagal: ${error.message}`)
    }
  })
}
