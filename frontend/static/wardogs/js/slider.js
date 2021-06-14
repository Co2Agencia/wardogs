var slider = document.getElementById('slider'),
    sliderItems = document.getElementById('slides'),
    prev = document.getElementById('prev'),
    next = document.getElementById('next');


function slide(wrapper, items, prev, next) {
  var posX1 = 0,
      posX2 = 0,
      posInitial,
      posFinal,
      threshold = 100,
      slides = items.getElementsByClassName('slide'),
      slidesLength = slides.length,
      slideSize = items.getElementsByClassName('slide')[0].offsetWidth,
      index = 0,
      allowShift = true;

  
  // Mouse events
  items.onmousedown = dragStart;
  
  // Touch events
  items.addEventListener('touchstart', dragStart);
  items.addEventListener('touchend', dragEnd);
  items.addEventListener('touchmove', dragAction);
  
  // Click events
  prev.addEventListener('click', function () { shiftSlide(-1) });
  next.addEventListener('click', function () { shiftSlide(1) });
  
  // Transition events
  items.addEventListener('transitionend', checkIndex);
  
  function dragStart (e) {
    e = e || window.event;
    e.preventDefault();
    posInitial = items.offsetLeft;
    
    if (e.type == 'touchstart') {
      posX1 = e.touches[0].clientX;
    } else {
      posX1 = e.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }

  function dragAction (e) {
    e = e || window.event;
    
    if (e.type == 'touchmove') {
      posX2 = posX1 - e.touches[0].clientX;
      posX1 = e.touches[0].clientX;
    } else {
      posX2 = posX1 - e.clientX;
      posX1 = e.clientX;
    }
    items.style.left = (items.offsetLeft - posX2) + "px";
  }
  
  function dragEnd (e) {
    posFinal = items.offsetLeft;
    if (posFinal - posInitial < -threshold) {
      shiftSlide(1, 'drag');
    } else if (posFinal - posInitial > threshold) {
      shiftSlide(-1, 'drag');
    } else {
      items.style.left = (posInitial) + "px";
    }

    document.onmouseup = null;
    document.onmousemove = null;
  }
  
  // Analiza si se esta yendo para adelante o para atras
  // Tambien la cantidad de slides que salta cuando tocamos las flechas
  // o arrastramos
  function shiftSlide(dir, action) {
    items.classList.add('shifting');
    if (allowShift) {
      if (!action) { posInitial = items.offsetLeft; }
      let cantSlides;

      if(window.innerWidth <= 1450){
        cantSlides = 1
      }
      else{
        cantSlides = 2
      }

      if (dir == 1) {
        items.style.left = (posInitial - (slideSize*cantSlides)) + "px";
        index+=cantSlides;      
      } else if (dir == -1) {
        items.style.left = (posInitial + (slideSize*cantSlides)) + "px";
        index-=cantSlides;
      }
    };
    
    allowShift = false;
  }
  
  // Checkea si esta en el final y cambia la direccion
  function checkIndex (){
    items.classList.remove('shifting');

    if (index <= -1) {
      if(window.innerWidth >= 2400){
          items.style.left = -(slidesLength*(slideSize/1.6)) + "px";
      }
      else if(window.innerWidth <=1450){
        items.style.left = -(slidesLength*(slideSize/1.15)) + "px";
      }
      else{
        items.style.left = -(slidesLength*(slideSize/1.2)) + "px";
      }
      index = slidesLength - 1;
    }

    if (index >= slidesLength) {
      items.style.left = (slideSize-slideSize/2) + "px";
      index = 0;
    }
    allowShift = true;
  }
}

try{
  slide(slider, sliderItems, prev, next);
}
catch{
  console.log("No hay noticias creadas.")
}