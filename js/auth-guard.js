import { supabase } from "./supabase.js"

try {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    alert(`Silahkan masuk terlebih dahulu: ${error.message}`)
    window.location.replace("login.html")
  } else if (!data.user) {
    window.location.replace("login.html")
  } else {
    const namaUser = document.getElementById("user-name")
    const displayName = data.user.user_metadata?.display_name

    if (namaUser && typeof displayName === "string" && displayName.trim()) {
      namaUser.textContent = displayName
    }

    document.body.classList.remove("auth-pending")
  }
} 
catch (error) {
  alert(`Terjadi masalah saat masuk: ${error.message}`)
  window.location.replace("login.html")
}
