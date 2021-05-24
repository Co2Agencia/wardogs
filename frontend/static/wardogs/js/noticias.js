const noticias = document.querySelector("#noticias");
const paginationMaster = document.querySelector("#pagination-master");
const user_token = JSON.parse(document.getElementById("user_token").textContent);
const bannerSpan = document.querySelector(".banner-noticias .titulos-noticias span");


// Elementos para Filtro|Buscar noticia
let formBuscar = document.querySelector("#filtros-contenedor .buscar-filtro");
let ordenarFiltro = document.querySelector("#ordenar-noticia");


// Elementos para click Noticia
let counter = 0;
let counterNoticia = 1;
let currentNoticia;

const url = "api/noticia-list";

// Banner
banner.ponerBanner("noticia")


// Carga noticias
fetch(url, {
  method: "GET",
  headers: {
    "Content-type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    renderData(data);
    renderPagination(data);
  });

// Render Noticias
function renderData(datos) {
  noticias.innerHTML = "";
  let resultados = datos.results;
  resultados.map((dato, index) => {

    // Fecha
    function fechaString(){
      let fecha = new Date(dato.fecha);
      let opciones = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      let string = fecha.toLocaleDateString("es-ES", opciones);

      return string
    }

    // Me Gusta
    function MeGusta(){
      let mgIcon = "";
      let megustas = Object.values(dato.megustaData.megustas);
      megustas.map((mg, index) => {
        if (mg.usuario_id == user_id) {
          // megustaIcon = `<i class="fas fa-thumbs-up" id="btn-megusta" onClick="meGusta(${dato.id})"></i>`;
          mgIcon = "fas fa-thumbs-up"
        } else {
          mgIcon = "far fa-thumbs-up"
          // megustaIcon = `<i class="far fa-thumbs-up" id="btn-megusta" onClick="meGusta(${dato.id})"></i>`;
        }
      });
      if (megustas.length == 0) {
        mgIcon = "far fa-thumbs-up"
        // megustaIcon = `<i class="far fa-thumbs-up" id="btn-megusta" onClick="meGusta(${dato.id})"></i>`;
      }

      return mgIcon
    }
 
    // Eliminar icono
    let eliminarIcon = "";
    if (dato.autor.id == user_id) {
      let eliminarContenedor = document.createElement("div")
      eliminarContenedor.className="eliminar-noticia"
      let iconoEliminar = document.createElement("id")
      iconoEliminar.className = "fas fa-trash"
      iconoEliminar.setAttribute("onclick", `return confirm("Seguro que desea eliminar noticia nº${dato.id}?")?eliminarNoticia(${dato.id}):"";`)
      let pEliminar = document.createElement("p")
      pEliminar.innerHTML = "Noticia nº${dato.id}"
      eliminarContenedor.appendChild(iconoEliminar)
      eliminarContenedor.appendChild(pEliminar)

      // eliminarIcon = `<div class='eliminar-noticia'><i class='fas fa-trash' onClick='return confirm("Seguro que desea eliminar noticia nº${dato.id}?")?eliminarNoticia(${dato.id}):"";'></i><p>Noticia nº${dato.id}</p></div>`;
    }

    // img notica
    function imgNoticia(){
      let contImg = document.createElement("div")
      contImg.className = "img-noticia"
      let img = document.createElement("img")
      img.setAttribute("src", `${dato.img}`)
      contImg.appendChild(img)

      return contImg
    }

    // Info Noticia
    class infoNoticia{
      autor(){
        let autorNoticia = document.createElement("div")
        autorNoticia.className = "autor-noticia"
        let imgAutor = document.createElement("div")
        imgAutor.className = "img-autor"
        let img = document.createElement("img")
        if(dato.autor.img.url){
          img.setAttribute("src", `${dato.autor.img.url}`)
        }
        else{
          img.setAttribute("src", `/static/wardogs/img/default_user.jpg`)
        }

        let nombre = document.createElement("h4")
        nombre.innerHTML = dato.autor.username

        let valoracion = document.createElement("div")
        valoracion.className = "valoracion-autor"
        let valoracionTotal = document.createElement("span")
        valoracionTotal.innerHTML = `${dato.megustaData.total}`
        let valoracionMg = document.createElement("i")
        valoracionMg.className = MeGusta()
        valoracionMg.setAttribute("id", "btn-megusta")
        valoracionMg.setAttribute("onclick", `meGusta(${dato.id})`)
        valoracion.appendChild(valoracionTotal)
        valoracion.appendChild(valoracionMg)

        imgAutor.appendChild(img)
        autorNoticia.appendChild(imgAutor)
        autorNoticia.appendChild(nombre)
        autorNoticia.appendChild(valoracion)

        return autorNoticia
      }
      titulos(){
        let contenedor = document.createElement("div")
        contenedor.className = "titulos-noticia"
        let titulo = document.createElement("h3")
        titulo.innerHTML = dato.titulo
        let subtitulo = document.createElement("p")
        subtitulo.innerHTML = dato.subtitulo
        contenedor.appendChild(titulo)
        contenedor.appendChild(subtitulo)

        return contenedor
      }

      descripcion(){
        let contenedor = document.createElement("div")
        contenedor.className = "descripcion-noticia"
        let p = document.createElement("p")
        p.innerHTML = `${dato.descripcion}`
        contenedor.appendChild(p)

        return contenedor
      }

      fecha(){
        let p = document.createElement("p")
        p.className = "fecha-noticia"
        p.innerHTML = `Creado el ${fechaString()}`
        return p
      }

      accionNoticia(){
        let accionesContenedor = document.createElement("div")
        accionesContenedor.className="acciones-noticia"
        let iconoEliminar = document.createElement("i")
        iconoEliminar.className = "fas fa-trash"
        iconoEliminar.setAttribute("onclick", `return confirm("Seguro que desea eliminar noticia nº${dato.id}?")?eliminarNoticia(${dato.id}):"";`)
        let numeroNoticia = document.createElement("p")
        numeroNoticia.innerHTML = `Noticia nº${dato.id}`

        let edit = document.createElement("i")
        edit.className = "fas fa-pen"
        edit.setAttribute("onclick", `editarNoticia("noticia",${dato.id})`)

        if(dato.autor.id == user_id){
          accionesContenedor.appendChild(iconoEliminar)
          accionesContenedor.appendChild(edit)
        }


        accionesContenedor.appendChild(numeroNoticia)

        return accionesContenedor
      }

      total(){
        let infoNoticia = document.createElement("div")
        infoNoticia.className = "info-noticia"
        let autor = this.autor()
        let titulos = this.titulos()
        let descripcion = this.descripcion()
        let fecha = this.fecha()
        let accionNoticia = this.accionNoticia()
        infoNoticia.appendChild(autor)
        infoNoticia.appendChild(titulos)
        infoNoticia.appendChild(descripcion)
        infoNoticia.appendChild(fecha)
        infoNoticia.appendChild(accionNoticia)

        return infoNoticia
      }
    }

    // Noticia Entera
    function Noticia(){
      let noticiaMaster = document.createElement("div")
      noticiaMaster.className = "noticia-master"
      let contNoticia = document.createElement("div")
      contNoticia.className = "noticia-contenedor"
      let thisNoticia = document.createElement("div")
      thisNoticia.className = `noticia noticia-${dato.id}`
      contNoticia.appendChild(thisNoticia)
      noticiaMaster.appendChild(contNoticia)

      let img = imgNoticia()
      let info = new infoNoticia()
      info = info.total()

      thisNoticia.appendChild(img)
      thisNoticia.appendChild(info)

      return noticiaMaster
    }

    let datosNoticia = Noticia()
    noticias.appendChild(datosNoticia)

    index += 1;
  });
}

// Click Noticia
document.querySelector("body").addEventListener("click", function (e) {
  if (e.target.closest(".noticia")) {
    if (e.target.closest(".img-noticia")) {
      let $target = e.target.closest(".img-noticia");
      let parent = $target.closest(".noticia");
      classCurrentNoticia = parent.className.split(" ");
      classCurrentNoticia = "." + classCurrentNoticia[1];

      // Elementos de noticia
      let thisNoticia = document.querySelector(classCurrentNoticia);
      let desc = thisNoticia.children[1].children[2];
      let autor = thisNoticia.children[1].children[0];
      let display = window.getComputedStyle(desc).display;
      let fecha = thisNoticia.children[1].children[3];
      let infoNoticia = thisNoticia.children[1];
      let img = thisNoticia.children[0];
      if (display == "none" && counter == 0) {
        counter += 1;
        desc.style.display = "block";
        autor.style.marginTop = "0";
        infoNoticia.style.height = "70%";
        img.style.height = "30%";
        thisNoticia.style.height = "40rem";
        thisNoticia.style.width = "40rem";
        thisNoticia.style.zIndex = 10;
        currentNoticia = thisNoticia;
      } else {
        counter = 0;
        let desc = document.querySelectorAll(".noticia .descripcion-noticia");
        for (let i = 0; i < desc.length; i++) {
          desc[i].style.display = "none";
        }
        let infoNoticia = document.querySelectorAll(".noticia .info-noticia");
        for (let i = 0; i < infoNoticia.length; i++) {
          infoNoticia[i].style.height = "55%";
        }
        let autor = document.querySelectorAll(".noticia .autor-noticia");
        for (let i = 0; i < autor.length; i++) {
          autor[i].style.marginTop = "-10%";
        }
        let img = document.querySelectorAll(".noticia .img-noticia");
        for (let i = 0; i < img.length; i++) {
          img[i].style.height = "45%";
        }
        let noticia = document.querySelectorAll(".noticia");
        for (let i = 0; i < noticia.length; i++) {
          noticia[i].style.height = "25rem";
          noticia[i].style.width = "30rem";
          noticia[i].style.zIndex = 1;
        }
        currentNoticia = undefined;
      }
    }
    if (currentNoticia != undefined) {
      if (e.target.closest(".noticia").className != currentNoticia.className) {
        currentNoticia.children[0].click();
      }
    }
  } else if (e.target) {
    let noticia = document.querySelectorAll(".noticia");
    for (let i = 0; i < noticia.length; i++) {
      let desc = noticia[i].children[1].children[2];
      if (desc.style.display != "none") {
        noticia[i].children[0].click();
      }
    }
  }
});

// Pagination
function renderPagination(data) {
  paginationMaster.innerHTML = "";

  // Datos pagination
  let nextPag = data.links.next;
  let prevPag = data.links.previous;
  let totalNoti = data.count;
  let cantPag = data.total_pages;
  let currentPag = data.current;

  // Elementos DOM
  let divCont = document.createElement("div");
  divCont.setAttribute("id", "pagination-contenedor");

  // Btn Prev
  let btnPrev = document.createElement("button");
  btnPrev.setAttribute("rel", `${prevPag}`);
  btnPrev.innerHTML = "Anterior";
  btnPrev.className = "btn-prev";

  if (prevPag) {
    divCont.appendChild(btnPrev);
  }

  // Btn paginas
  let divPags = document.createElement("div");
  divPags.className = "paginas-btn";
  for (let i = 1; i <= cantPag; i++) {
    let pagBtn = document.createElement("button");
    pagBtn.innerHTML = `${i}`;
    pagBtn.className = `btn-pag pag-${i}`;
    pagBtn.setAttribute("rel", `${i}`);
    if (i === currentPag) {
      pagBtn.disabled = true;
      pagBtn.className = `btn-pag pag-${i} current`;
    }
    divPags.appendChild(pagBtn);
  }
  divCont.appendChild(divPags);

  // Btn next
  let btnNext = document.createElement("button");
  btnNext.setAttribute("rel", `${nextPag}`);
  btnNext.innerHTML = "Siguiente";
  btnNext.className = "btn-next";
  if (nextPag) {
    divCont.appendChild(btnNext);
  }
  paginationMaster.appendChild(divCont);
}

// Click en pagination
document.querySelector("body").addEventListener("click", function (e) {
  let element = e.target;
  let classElement = element.className.split(" ");
  let baseUrl;

  // Click en boton de paginas
  if (classElement[0] == "btn-pag") {
    try {
      baseUrl = element.closest(".paginas-btn").nextSibling.getAttribute("rel");
    } catch {
      baseUrl = element
        .closest(".paginas-btn")
        .previousSibling.getAttribute("rel");
    }

    pagClick = element.getAttribute("rel");

    let url2 = baseUrl.replace(/(?<=page\=)[0-9]+/, pagClick);
    console.log(url2);

    fetch(url2, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        renderData(data);
        renderPagination(data);
      });
  }

  // Click en boton nextPag
  else if (classElement[0] == "btn-next") {
    let url = e.target.getAttribute("rel");

    fetch(url, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        renderData(data);
        renderPagination(data);
      });
  }

  // Click en boton prevPag
  else if (classElement[0] == "btn-prev") {
    let url = e.target.getAttribute("rel");

    fetch(url, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        renderData(data);
        renderPagination(data);
      });
  }
});


// Filtros
formBuscar.addEventListener("submit", function (e) {
  e.preventDefault();

  let inputFormBuscar = document.querySelector(
    "#filtros-contenedor .buscar-filtro input"
  );
  let url = `http://127.0.0.1:8000/api/noticia-list?search=${inputFormBuscar.value}`;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
      renderPagination(data);
      formBuscar.reset();
    });
});

ordenarFiltro.addEventListener("change", function (e) {
  e.preventDefault();

  let valor = this.value;
  let url = `http://127.0.0.1:8000/api/noticia-list?ordering=${valor}`;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      renderData(data);
      renderPagination(data);
    });
});

// Eliminar noticia
function eliminarNoticia(noticia_id) {

  let url = `api/noticia-delete/${noticia_id}`;
  let parent = document.querySelector(`.noticia-${noticia_id}`).closest(".noticia-master");
  let parent2;

  // Intenta seleccionar la noticia del slide
  try{
    parent2 = document.querySelector(`.slide-noticia-${noticia_id}`).closest(".noticia-master")
    parent2.style.opacity = 0
  }
  catch(error){
    console.log("La noticia no esta en el slider")
  }

  parent.style.opacity = 0;

  setTimeout(function () {
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        Authorization: `token ${user_token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => alert(data));
      parent.remove();
      try{
        parent2.remove()
      }
      catch(error){
      }
  }, 500);
}


// Me gusta
function meGusta(noticia_id) {
  let parent = document.querySelector(`.noticia-${noticia_id}`) || document.querySelector(`.slide-noticia-${noticia_id}`);
  let valoracion = parent.children[1].children[0].children[2];
  let megustaNum = valoracion.children[0];
  let megustaIcon = valoracion.children[1];
  let megustaClass = megustaIcon.className.split(" ");
  let dataMg = { noticia: noticia_id, usuario: user_id, megusta: true };
  // Noticia slide
  let parentSlide = document.querySelector(`.slide-noticia-${noticia_id}`);
  let valoracionSlide = parentSlide.children[1].children[0].children[2];
  let megustaNumSlide = valoracionSlide.children[0];
  let megustaIconSlide = valoracionSlide.children[1];
  let megustaClassSlide = megustaIconSlide.className.split(" ");
  
  let url = "api/noticia-megusta";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: `token ${user_token}`,
    },
    body: JSON.stringify(dataMg),
  })
    .then((response) => {
      if (response.status !== 200) {
        if (response.status === 401) {
          return console.log(
            "Hubo problemas de autentificación, intente loguearse antes de poner me gusta. Status code: " +
              response.status
          );
        }
        return console.log(
          "Parece que hubo un problema. Status code: " + response.status
        );
      } else {
        if (megustaClass[0] == "far") {
          megustaIcon.className = "fas fa-thumbs-up";
          megustaIconSlide.className = "fas fa-thumbs-up";

          let num = parseInt(megustaNum.innerHTML);

          megustaNum.innerHTML = num + 1;
          megustaNumSlide.innerHTML = num + 1;

        } else {
          megustaIcon.className = "far fa-thumbs-up";
          megustaIconSlide.className = "far fa-thumbs-up";

          let num = parseInt(megustaNum.innerHTML);

          megustaNum.innerHTML = num - 1;
          megustaNumSlide.innerHTML = num - 1;
        }
      }
    })
    .catch((error) => {
      console.log("Error");
    });
}
 
// Editar noticia
/* Ejemplo */

function editarNoticia(nombre ,id){
  let ef = new EditForm()
  ef.crearForm(nombre, id, user_token)
}

/*
Nombre para fetch es => key
Valor de input es => value.value
Tipo de input es => value.tipo
*/


// Acciones | Agregar inputs y acciones
inputsAcciones["noticia"] = {
  tituloNoticia:{
    tipo:"text", label:"Titulo", required:"true"
  },
  subtituloNoticia:{
    tipo:"text", label: "Subtitulo", required:"true"
  },
  descNoticia:{
    tipo: "textarea", label: "Descripción", required:"true"
  },
  imgNoticia:{
    tipo: "file", label:"Imágen"
  },
}

inputsAcciones["mision"] = {
  imgMision :{
    tipo:"file", label:"Imágen"
  },
  urlMision:{
    tipo:"url", label: "Url video"
  }

}

urlAcciones["noticia"] = "api/noticia-create"
urlAcciones["mision"] = "api/noticia-create"

if(user_id){
  if(user_superuser){
    agregarAccion("noticia")
    agregarAccion("mision")
  }
}
