const body = document.querySelector("body")
const nav = document.querySelector("nav")
const navLinks = document.querySelector("nav .nav-links")
const navParrafoUsuario = document.querySelector("nav .nav-usuario-contenedor p")
const navImgUsuarioContenedor = document.querySelector("nav .nav-usuario-img")
const navImgUsuario = document.querySelector("nav .nav-usuario-img img")

// Info usuario
const user_id = JSON.parse(document.getElementById("user_id").textContent);
const user_superuser = JSON.parse(document.getElementById("user_superuser").textContent);

//Banner
const bannerImg = document.querySelector(".banner-img")
let bannerCon = document.createElement("div")
let bannerSubCon = document.createElement("div")
let bannerForm = document.createElement("form")
bannerCon.className = "editar-banner-contenedor"
bannerSubCon.className = "editar-banner"

// Acciones Elementos
const inputsAcciones = {}
let usuarioFormCheck = ["noticia"]
const urlAcciones = {}
const accionesContenedor = document.getElementById("acciones-contenedor")
let btnFormAccionesCerrar = document.createElement("button")
let formAccionesContenedor = document.createElement("div")
formAccionesContenedor.className = "form-acciones-contenedor"
let formAcciones = document.createElement("form")

// Elementos Generales
const inputsEditar = {}
let formEdit = document.createElement("form")
let formEditContenedor = document.createElement("div")
formEditContenedor.className = "form-edit-contenedor"


// NavBar al scrollear
window.addEventListener("scroll", function(){
    let scrollTop = document.documentElement.scrollTop

    if(scrollTop > 130){
        if(user_id){
            navParrafoUsuario.style.transform = `translateX(${getComputedStyle(navParrafoUsuario).width}) skewX(20deg)`
            navParrafoUsuario.style.opacity = "0"
        }
        return nav.style.background = "rgba(0,0,0,0.5)"
    }

    if(user_id){
        return nav.style.background = "rgba(0,0,0,0)",
        navParrafoUsuario.style.transform = `translateX(0) skewX(0deg)`,
        navParrafoUsuario.style.opacity = "1";
    }
    return nav.style.background = "rgba(0,0,0,0)"

})

// Datos del usuario
class UsuarioAcciones{
    async logout(){
        let url = 'api/login'
        let authorization = `Token ${user_token}`
        await fetch(url, {
            method:"POST",
            headers:{
                "Authorization":authorization
            }
        }).then((response)=> {
            if(response.status == 205){
                location.reload();
                return false;
            }
        })
    }

    async getDetails(){
        let usuario_id = user_id
        let url = `api/usuario-detail/${usuario_id}`
        let authorization = `Token ${user_token}`
        let datos = {}
        await fetch(url, {
            method:"GET",
            headers:{
                "Authorization":authorization
            }
        }).then((response) => response.json())
        .then((data) => { 
            datos["id"] = data.id
            datos["username"] = data.username
            datos["email"] = data.email
        })

        return datos
    }

}


// Nav usuario links eventos
if(user_id){
    let clickContext = 0;
    let navUsuarioLinks = document.createElement("div")
    navUsuarioLinks.className = "nav-usuario-links"

    function hide_username(){
        if(document.documentElement.scrollTop > 130){
            navParrafoUsuario.style.transform = `translateX(${getComputedStyle(navParrafoUsuario).width}) skewX(20deg)`
            navParrafoUsuario.style.opacity = "0"
        }
    }

    window.addEventListener("click", function(e){
        $target = e.target
        $class = $target.className
        $id = $target.id

        if($class == "nav-usuario-imagen"){
            navUsuarioLinks.innerHTML = ""

            if(clickContext == 0){
                clickContext = 1
                navParrafoUsuario.style.transform = `translateX(0) skewX(0deg)`,
                navParrafoUsuario.style.opacity = "1";

                let link1 = document.createElement("a")
                let link2 = document.createElement("a")

                link1.innerHTML = "Salir"
                link1.className = "nav-usuario-link"
                link1.setAttribute("id", "salirCuenta")

                link2.innerHTML = "Ver cuenta"
                link2.className = "nav-usuario-link"
                link2.setAttribute("id", "verCuenta")

                navUsuarioLinks.append(link1, link2)
                navImgUsuarioContenedor.appendChild(navUsuarioLinks)
            }
            else{
                clickContext = 0
                hide_username()

                navUsuarioLinks.innerHTML = ""
                navImgUsuarioContenedor.removeChild(navUsuarioLinks)
            }
        }
        if($class !== "nav-usuario-link" && clickContext !== 0 && $class !== "nav-usuario-imagen"){
            clickContext = 0
            hide_username()

            navUsuarioLinks.innerHTML = ""
            navImgUsuarioContenedor.removeChild(navUsuarioLinks)
        }
        
        // Click en Salir
        if($id == "salirCuenta"){
            let uA = new UsuarioAcciones()
            uA.logout()
        }

    })

    window.addEventListener("scroll", function(e){
        if(clickContext !== 0 ){
            clickContext = 0
            hide_username()

            navUsuarioLinks.innerHTML = ""
            navImgUsuarioContenedor.removeChild(navUsuarioLinks)
        }
    })
}
window.addEventListener("click", function(e){
    let $target = e.target
    let $class = $target.className
    let $id = $target.id
    
    if($class == "btn-ingresar"){
        let ef = new EditForm()
        ef.total("login", 1, false)
    }
    
    // Click en ver contraseña icon
    if($id == "password-ver"){
        let parent = $target.closest(".editar-password-contenedor")
        let input = parent.children[0]
        let accion = $target.getAttribute("data-accion")

        if(accion == "ver"){
            $target.className = "far fa-eye-slash"
            $target.setAttribute("data-accion", "ocultar")
            input.setAttribute("type", "text")
        }
        else{
            $target.setAttribute("data-accion", "ver")
            $target.className = "far fa-eye"
            input.setAttribute("type", "password")
        }
    }
})

window.addEventListener("keyup", function(e){
    let $target = e.target
    let $class = e.target.classList

    if($class[1] == "editar-input"){
        let parent = $target.closest(".editar-input-contenedor")
        let label = parent.children[0]
        if($target.value.length > 0){
            label.className = "editar-label-active"
            $target.classList.add("editar-input-active")
        }
        else{
            label.classList.remove("editar-label-active")
            $target.classList.remove("editar-input-active")
        }
        
    }
})


// Cookies (csrf token)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// Ejecutadores y creadores de acciones
function agregarAccion(accion){
    let btnAccion = document.createElement("button")
    btnAccion.className = `crear-${accion}-btn`

    let descripcionAccion = document.createElement("p")
    descripcionAccion.innerHTML = "Crear "+accion
    descripcionAccion.className = "descripcion-accion"
    
    btnAccion.innerHTML = `<i class="fas fa-plus"></i>`
    btnAccion.setAttribute("onclick", `ejecutarAccion('${accion}')`)
    btnFormAccionesCerrar.setAttribute("onclick", `ejecutarAccion('${accion}')`)
  
    btnAccion.append(descripcionAccion)
  
    accionesContenedor.appendChild(btnAccion)
  }

function crearFormAccion(accion){
    formAccionesContenedor.innerHTML = ""
    formAcciones.innerHTML = ""
    formAcciones.className = `form-acciones crear-${accion}-form`

    //Titulo Formulario
    let tituloForm = document.createElement("h3")
    tituloForm.innerHTML = `Crear ${accion}`
    tituloForm.className = `titulo-form titulo-form-${accion}`

    // Boton para cerrar
    let btnFormCerrar = document.createElement("button")
    btnFormCerrar.innerHTML = `<i class="fas fa-times"></i>`
    btnFormCerrar.className = "form-acciones-cerrar form-cerrar-btn"
    btnFormCerrar.setAttribute("onclick", `ejecutarAccion('${accion}')`)

    // Boton de submit
    let btnCrear = document.createElement("button")
    btnCrear.innerHTML = `Crear ${accion}`
    btnCrear.className = `btn-form btn-form-${accion}`

    formAcciones.appendChild(tituloForm)
    formAccionesContenedor.setAttribute("data-accion", accion)
    formAcciones.setAttribute("data-accion", accion)
    formAccionesContenedor.appendChild(btnFormCerrar)
    formAccionesContenedor.appendChild(formAcciones)

    // Creando los inputs
    for (const [key, value] of Object.entries(inputsAcciones[accion])){
        // Label para inputs
        let label = document.createElement("label")
        label.setAttribute("for", key)
        label.innerHTML = value.label
        formAcciones.appendChild(label)

        // Analizando que tipo de input es
        if(value.tipo !== "textarea"){
            let input = document.createElement("input")
            input.className = `${accion}-form-${key}`
            input.setAttribute("name", key)
            input.setAttribute("type", value.tipo)
            if(value.required == "true"){
                input.required = "true"
            }
            formAcciones.appendChild(input)
        }
        else{
          let textarea = document.createElement("textarea")
          textarea.className = `${accion}-form-${key}`
          textarea.setAttribute("name", key)
          if(value.required == "true"){
            textarea.required = "true"
            }
          formAcciones.appendChild(textarea)
        }
      }
      formAcciones.appendChild(btnCrear)
}

function ejecutarAccion(accion){
    // Iconos Accion
    let elementoAccionIcon = document.querySelector(`.crear-${accion}-btn i`)
    let elementoAccionDescripcion = document.querySelector(`.crear-${accion}-btn .descripcion-accion`)

    // Crea El formulario
    crearFormAccion(accion)

    try {
        body.removeChild(formAccionesContenedor)
        body.style.overflowY = "visible" 
        elementoAccionIcon.className = `fas fa-plus`
        elementoAccionDescripcion.innerHTML = `Crear ${accion}`
      } catch (error) {
        body.insertAdjacentElement("afterbegin", formAccionesContenedor)
        body.style.overflowY = "hidden" 
        elementoAccionIcon.className = `fas fa-minus`
        elementoAccionDescripcion.innerHTML = `Cerrar ${accion}`
      }
}

formAcciones.addEventListener("submit", function(e){
    e.preventDefault()
    let accion = this.getAttribute("data-accion")
    let url = urlAcciones[`${accion}`]
    let token = `token ${user_token}`

    const thisForm = new FormData(this)
    let fd = new FormData()

    if(accion=="noticia"){
        fd.append('titulo', thisForm.get("tituloNoticia"))
        fd.append('subtitulo', thisForm.get("subtituloNoticia"))
        fd.append('descripcion', thisForm.get("descNoticia"))
        fd.append('img', thisForm.get("imgNoticia"))
        fd.append('usuario', user_id)
    }
  
    fetch(url, {
        method:"POST",
        body:fd,
        headers:{
            "Authorization": token
        },
    }).then((response) => {
        console.log(response)
    }).then((success)=>{
        console.log(success)
    }).catch(error=>console.log(error))

    // for(let key of fd.keys()){
    //     if(fd.get(key).size >= 2000000){
    //     return console.log(`El archivo ${fd.get(key).name} pesa mas de 2MB.`)
    //     }
    //     else if(fd.get(key).size < 2000000){
    //     console.log(`El archivo ${fd.get(key).name} pesa menos de 2MB.`)
    //     }
    //     else{
    //     console.log(key, fd.get(key))
    //     }
    // }
    this.reset()

})


// Formulario Edit
// Diccionarios para inputsEdit
inputsEditar["noticia"] = {
    titulo:{
      tipo:"text", label:"Titulo", required:"true"
    },
    subtitulo:{
      tipo:"text", label:"Subtitulo", required:"true"
    },
    img:{
      tipo:"file", label:"Imágen"
    },
    descripcion:{
      tipo:"textarea", label:"Descripción", required:"true"
    },
  }

inputsEditar["login"] = {
    username:{
      tipo:"text", label:"Usuario o correo electrónico", required:"true"
    },
    password:{
      tipo:"password", label:"Contraseña", required:"true"
    },
  }


class EditForm{
    /* ¿Como funciona?
    1- Crear un diccionario con los inputs en inputsEditar => Si es para noticia seria algo como:
        inputsEditar["noticia"] = {...}

    2- Llamar a editForm.total()
    
    3- Como parametro de total() tenemos que poner:
        # Nombre => Si es para noticia ponemos "noticia"
        # id => Es el id del elemento que buscamos editar
    */
    inputs(nombre, editar){
        let contenedor = document.createElement("div")
        let inputDict = inputsEditar[`${nombre}`]
        contenedor.className = "editar-inputs"

        for (const [key, value] of Object.entries(inputDict)){
            // Label para inputs
            let label = document.createElement("label")
            label.setAttribute("for", key)
            label.innerHTML = value.label
            // contenedor.appendChild(label)
    
            // Analizando que tipo de input es
            if(value.tipo !== "textarea" && value.tipo !== "file" && value.tipo !== "password" ){
                let input = document.createElement("input")
                let cont = document.createElement("div")
                cont.className = `editar-input-contenedor`

                input.className = `editar-${nombre}-${key} editar-input`
                input.setAttribute("name", key)
                input.setAttribute("type", value.tipo)
                if(editar){
                    input.value = value.value
                }
                if(value.required == "true"){
                    input.required = "true"
                }
                cont.appendChild(label)
                cont.appendChild(input)
                contenedor.appendChild(cont)
            }
            else if(value.tipo == "password"){
                let cont = document.createElement("div")
                let contCont = document.createElement("div")
                cont.className = `editar-${key}-contenedor`
                contCont.className = `editar-input-contenedor`

                let icon = document.createElement("i")
                icon.className = "far fa-eye"
                icon.id = "password-ver"
                icon.setAttribute("data-accion", "ver")

                let input = document.createElement("input")
                input.setAttribute("name", key)
                input.setAttribute("type", value.tipo)
                input.className = `editar-${nombre}-${key} editar-input`
                input.required = "true"

                if(editar){
                    input.value = value.value
                }

                cont.appendChild(input)
                cont.appendChild(icon)

                contCont.appendChild(label)
                contCont.appendChild(cont)

                contenedor.appendChild(contCont)
            }
            else if(value.tipo === "file"){
                let contenedor2 = document.createElement("div")
                contenedor2.className = "form-edit-img"
                let contenedorImg = document.createElement("div")
                let img = document.createElement("img")
                img.setAttribute("src", value.src)
                let imgDesc = document.createElement("p")
                imgDesc.innerHTML = "Imágen anterior"
                
                let input = document.createElement("input")

                input.className = `editar-${nombre}-${key}`
                input.setAttribute("name", key)
                input.setAttribute("type", value.tipo)
                if(value.required == "true"){
                    input.required = "true"
                }
                
                contenedorImg.appendChild(img)
                contenedorImg.appendChild(imgDesc)
                contenedor2.appendChild(contenedorImg)
                contenedor2.appendChild(input)
                contenedor.appendChild(contenedor2)
            }
            else{
              let textarea = document.createElement("textarea")
              textarea.className = `editar-${nombre}-${key}`
              textarea.setAttribute("name", key)
              if(editar){
                textarea.value = value.value
              }
              if(value.required == "true"){
                textarea.required = "true"
                }
                contenedor.appendChild(textarea)
            }
          }
        
        return contenedor
    }

    btnCerrar(){
        let btn = document.createElement("button")
        btn.className = `form-editar-cerrar form-cerrar-btn`
        btn.innerHTML = `<i class="fas fa-times"></i>`
        btn.setAttribute("onclick", `cerrarEdit()`)

        return btn
    }

    btnCrear(nombre){
        let btn = document.createElement("button")
        btn.className = `btn-form btn-editar-${nombre}`
        if(nombre == "login"){
            btn.innerHTML = `Ingresar`
        }
        else{
            btn.innerHTML = `Editar`
        }
        return btn
    }

    form(nombre, id){
        let titulo = document.createElement("h3")
        titulo.className = "editar-form-titulo"
        
        titulo.innerHTML = `Editar ${nombre}`

        formEdit.className = `editar-form editar-${nombre}-form`
        formEdit.setAttribute(`data-id`, id)
        formEdit.setAttribute(`data-nombre`, nombre)
        if(nombre !== "login"){
            formEdit.appendChild(titulo)
        }

        return formEdit
    }

    total(nombre, id, editar){
        let cerrarBtn = this.btnCerrar()
        let btnCrear = this.btnCrear(nombre)

        let inputs = this.inputs(nombre, editar)
        let form = this.form(nombre, id)

        form.appendChild(inputs)
        form.appendChild(btnCrear)
        formEditContenedor.appendChild(cerrarBtn)
        formEditContenedor.appendChild(form)
        body.style.overflowY = "hidden"
        body.insertAdjacentElement("afterbegin", formEditContenedor)
    }

    crearForm(nombre, id, token){
        let inputDict = inputsEditar[`${nombre}`]
        let url = `api/${nombre}-detail/${id}`
        let authorization

        authorization = `token ${token}`

        fetch(url, {
            method:"GET",
            headers:{
                "Content-type": "application/json",
                "Authorization": authorization
            }
        }).then((response)=>response.json())
        .then((data)=>{
            for (const [key, val] of Object.entries(data)){

                if(key=="autor" && val.id !== user_id){
                    return alert("El usuario no fue el que creo el/la "+nombre+".")
                }
                for (const [key2, val2] of Object.entries(inputDict)){
                    if(key2 == key){ // Analiza si el tipo de input es un "file"
                        if(val2.tipo !== "file"){
                            val2.value = val
                        }
                        else{
                            val2.src = val
                        }
                    }
                }
            }
            return this.total(nombre, id, true)
        })
    }
}

function cerrarEdit(){
    try{
        body.style.overflowY = "visible"
        formEdit.innerHTML = ""
        formEditContenedor.innerHTML = ""
        body.removeChild(formEditContenedor)
    }
    catch(error){
        console.log("No hay un formulario de edit para eliminar")
    }
}

formEdit.addEventListener("submit", function(e){
    e.preventDefault()

    let csrftoken = getCookie('csrftoken')
    let nombre = this.getAttribute("data-nombre")
    let id = this.getAttribute("data-id")
    let thisForm = new FormData(this)
    let fd = new FormData()
    let inputDict = inputsEditar[`${nombre}`]
    let url = `api/${nombre}-update/${id}`
    let token = `token ${user_token}`

    // Guardando los inputs en "fd"
    for(const [key, value] of Object.entries(inputDict)){
        let input = thisForm.get(key)
        if(value.tipo === "file" && input.size > 0){
            fd.append(key, input)
        }
        else if(value.tipo !== "file"){
            fd.append(key, input)
        }
    }

    // Checkeando si hay que poner el id del usuario
    if(usuarioFormCheck.includes(nombre)){
        fd.append("usuario", user_id)
    }
    fetch(url,{
        method: "POST",
        body: fd,
        headers:{
            "Authorization":token,
            "X-CSRFToken": csrftoken,
        },
    }).then(response=>{
        if(response.status == 200 || 201){
            location.reload()
        }
    })
    .catch(error => console.log(error.error))
})



// Banners
class Banners{
    async ponerBanner(sector){
        let data = await this.getBanner(sector)
        let img = document.createElement("img")
        let i = document.createElement("i")

        i.className = "fas fa-pen"
        i.setAttribute("onclick", `editBanner('${data.sector}')`)

        img.setAttribute("src", data.img)
        img.setAttribute("alt", `Banner ${data.sector}`)

        bannerImg.innerHTML = ""
        bannerImg.appendChild(img)

        if(user_superuser){
            bannerImg.appendChild(i)
        }
    }

    btnCerrar(){
        let btn = document.createElement("button")
        btn.className = `form-cerrar-btn editar-banner-cerrar-btn`
        btn.innerHTML = `<i class="fas fa-times"></i>`
        btn.setAttribute("onclick", `cerrarBannerEdit()`)

        return btn
    }

    getBanner(sector){
        let url = `api/banner-detail/${sector}`

        return fetch(url).then(response => response.json()).then(data=> {return data})
    }
    
    async editForm(sector){
        let data = await this.getBanner(sector)
        let inputDict = {}
        for(const [key, val] of Object.entries(data)){
            inputDict[key] = val
        }

        // Form
        bannerForm.setAttribute("data-sector", sector)
        
        // Img
        let imgCon = document.createElement("div")
        imgCon.className = "editar-banner-img-contenedor"
        let img = document.createElement("img")
        img.setAttribute("src", data.img)
        let imgP = document.createElement("p")
        imgP.innerHTML = `Imágen actual`

        // img input
        let imgInputCon = document.createElement("div")
        imgInputCon.className = "form-banner-img-contenedor"
        let imgInputP = document.createElement("p")
        imgInputP.innerHTML = "Arrastar imágen acá"

        let imgInput = document.createElement("input")
        imgInput.setAttribute("type", "file")
        imgInput.className = "editar-banner-img"
        imgInput.setAttribute("name", "img")

        imgInputCon.appendChild(imgInputP)
        imgInputCon.appendChild(imgInput)

        // Boton submit
        let btn = document.createElement("button")
        btn.innerHTML = "Editar"
        
        // Boton cerrar
        let btnCerrar = this.btnCerrar()

        imgCon.appendChild(img)
        imgCon.appendChild(imgP)

        bannerForm.appendChild(imgInputCon)
        bannerForm.appendChild(btn)

        bannerSubCon.appendChild(imgCon)
        bannerSubCon.appendChild(bannerForm)
        bannerCon.appendChild(btnCerrar)
        bannerCon.appendChild(bannerSubCon)

        body.style.overflowY = "hidden"
        body.insertAdjacentElement("afterbegin", bannerCon)
    }

    cambiarImg(src){
        let img = bannerImg.children[0]
        return img.setAttribute("src", src)
    }
}

let banner = new Banners()

function editBanner(sector){
  banner.editForm(sector)
}

function cerrarBannerEdit(){
    try{
        body.style.overflowY = "visible"
        bannerForm.innerHTML = ""
        bannerSubCon.innerHTML = ""
        bannerCon.innerHTML = ""

        body.removeChild(bannerCon)
    }
    catch(error){
        console.log("No hay un formulario de banner edit para eliminar.")
    }
}

bannerForm.addEventListener("submit", function(e){
    e.preventDefault()

    let csrftoken = getCookie('csrftoken')
    let token = `token ${user_token}`

    let fd = new FormData(this)
    let sector = this.getAttribute("data-sector")
    let img = fd.get("img")

    let url = `api/banner-update/${sector}`

    fetch(url, {
        method: "POST",
        body: fd,
        headers:{
            "Authorization":token,
            "X-CSRFToken": csrftoken,
        },
    }).then(response=>{
        if(response.status==200||201){
            return response.json()
        }
    })
    .then(data=>{
        banner.cambiarImg(data.banner.img)
        cerrarBannerEdit()
    })
    .catch(error => console.log("Hubo un error"))
})



// Checkea el archivo que se sube al banner edit form
bannerForm.addEventListener("change", async function(e){
    let parent = this.closest(".editar-banner")
    let imgBanner = parent.children[0].children[0]
    let imgBannerP = parent.children[0].children[1]
    
    let fd = new FormData(this)
    let sector = this.getAttribute("data-sector")

    let imgURL;

    let img = fd.get("img")
    let imgSize = formattedFileSize(img)

    let fileCont = this.children[0]
    let p = fileCont.children[0]
    p.innerHTML = ""

    let archivosPermitidos = ["jpg", "png", "jpeg"]
    let check =  imageChecker(img, archivosPermitidos)

    if(check.check){
        if(img.size !== 0 && img.size < 1500000){
            imgURL = URL.createObjectURL(img)
            imgBanner.setAttribute("src", imgURL)
            imgBannerP.innerText = img.name
            let span = document.createElement("span")
            span.innerText = "Tamaño: "+ imgSize
            p.innerText = img.name
            p.appendChild(span)
        }
        else if(img.size > 1500000){
            let data = await banner.getBanner(sector)
    
            imgURL = data.img
            imgBanner.setAttribute("src", imgURL)
            imgBannerP.innerText = "Imágen actual"
    
            p.innerText = "La imágen supera los 1.5 MB"
        }
    }
    else if(img.size == 0){
        let data = await banner.getBanner(sector)
            
        imgURL = data.img
        imgBanner.setAttribute("src", imgURL)
        imgBannerP.innerText = "Imágen actual"

        p.innerText = "Ninguna imágen seleccionada."
    }
    else{
        p.innerText = check.string
    }


})



// File Size Formatter & Image Checker
function formattedFileSize(file){
    let str = `${file.size}`
    let formattedSize;
    
    (str.length > 6) ? (formattedSize = str.slice(0,-6)+"."+str.slice(-6,-4) + " MB"):(formattedSize = str.slice(0,-3)+" KB");
    
    return formattedSize
}

function imageChecker(img, archivosPermitidos){
    let name = img.name
    let data = {}
    data["check"] = false
    data["string"] = "Archivo no permitido. Extensiones permitidas: "

    let extPer = archivosPermitidos
    
    for(let i = 0; i < extPer.length; i++){
        let search = name.search(extPer[i])

        if(search >= 0) {data["check"] = true; data["string"] = "Extension de archivo permitida"}
        else{data["string"] += " "+extPer[i]}
    }

    return data
}

// Evitando que se pueda acceder a los valores de los inputs
setTimeout(function(){
    for(const [key, value] of Object.entries(inputsAcciones)){
        Object.freeze(inputsAcciones[key])
        for(const [key2, value2] of Object.entries(inputsAcciones[key])){
          Object.freeze(inputsAcciones[key][key2])
        }
      }
}, 100)
