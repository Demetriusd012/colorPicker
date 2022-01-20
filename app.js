//Global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popUp = document.querySelector('.copyContainer');
const popUpBox = popUp.children[0];
const sliderContainers = document.querySelectorAll('.color .sliders');
const adjustBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.closeAdjustment');


let initialColors;
//This is for local Storage
let savedPalettes = [];

//Add event listners
generateBtn.addEventListener('click', () => {
  randomColors();
})

sliders.forEach((slider) => {
  slider.addEventListener('input', hslControls);
})

colorDivs.forEach((slider, index) => {
  slider.addEventListener('change', () => {
    updateTextUI(index);
  })
})
adjustBtn.forEach((adjust, index) => {
  adjust.addEventListener('click', () => {
    openAdjust(index);
  })
})
closeAdjustments.forEach((close, index) => {
  close.addEventListener('click', () => {
    closeAdjust(index);
  })
})

currentHexes.forEach(hex => {
  hex.addEventListener('click', () => {
    copyToClipboard(hex); 
    
  })
})

lockBtn.forEach((lock, index) => {
  lock.addEventListener('click', () => {
    locked(lock, index);
  })
})
popUpBox.addEventListener('transitionend', () => {
  if (popUp.classList.contains('active')) {
    popUp.classList.remove('active');
  popUpBox.classList.remove('active');
  }
})


//Functions
//Color Genereator
function generateHex() {
  // const letters = '0123456789ABCDEF';
  // let hash = '#';
  // for (let i = 0; i <6; i++){
  //   hash += letters[Math.floor(Math.random() * 16)];
  //   console.log(i);
  // }
  // return hash;
  //We used the javascript library instead of all the complication above
  const hexColor = chroma.random();
  return hexColor;

}

function randomColors() {
  //
  initialColors = [];
  colorDivs.forEach((div, index) => {
  
    const randomColor = generateHex();
    const hexText = div.children[0];
    //Add color to an array
    // console.log(hexText.innerText);
    // console.log(initialColors);
    if (div.classList.contains('locked')) {
      initialColors.push(hexText.innerText);
      // console.log(initialColors);
      return;

    } else {
      
      initialColors.push(chroma(randomColor).hex());
    }
    
    
    // /Add the color to the bg
    div.style.backgroundColor = randomColor;
    hexText.innerHTML = randomColor;
    //Check Contrast
    checkTextContrast(randomColor, hexText);

  // Initial Colorize sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];


    colorizeSliders(color, hue, brightness, saturation);
    
  })
  //Reset Inputs
  resetInputs();
//Check For Button Contrast
  adjustBtn.forEach((btn, index) => {
    // console.log(btn);
    // console.log(lockBtn[index]);
    (initialColors[index], btn);
    checkTextContrast(initialColors[index], lockBtn[index]);
  })

}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > .5) {
    text.style.color = 'black';
  } else {
    text.style.color = 'white';
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //Scale saturation
  const noSat = color.set('hsl.s', 0);
  const fullSat = color.set('hsl.s', 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  //Scale Brightness
  const midBright = color.set('hsl.l', .5);
  const scaleBright = chroma.scale(['black', midBright, 'white']);
  

  //Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`;
  
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)},${(midBright)},${scaleBright(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;

}

function hslControls(e) {

  const index = e.target.getAttribute('data-bright') ||
    e.target.getAttribute('data-sat') ||
    e.target.getAttribute('data-hue');

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  console.log(`initialArr: ${bgColor}`);
  
  console.log(bgColor);
  let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);
  
  colorDivs[index].style.backgroundColor = color;
  console.log(colorDivs[index]);

  //Colorize inputs/sliders
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index){
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  console.log(color);
  const textHex = activeDiv.querySelector('h2');
  const icons = activeDiv.querySelectorAll('.controls button');
  textHex.innerText = color.hex();
  //Check Contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}
function resetInputs() {
  const sliders = document.querySelectorAll('.sliders input');
  sliders.forEach(slider => {
    if (slider.name === 'hue') {
      const hueColor = initialColors[slider.getAttribute('data-hue')];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
     
    }
    if (slider.name === 'brightness') {
      const brightColor = initialColors[slider.getAttribute('data-bright')];
      const brightValue = chroma(brightColor).hsl()[1];
      slider.value = Math.floor(brightValue * 100) /100;
      
    }
    if (slider.name === 'saturation') {
      const satColor = initialColors[slider.getAttribute('data-sat')];
      const satValue = chroma(satColor).hsl()[2];
      slider.value = Math.floor(satValue * 100) /100;
      
    }


  })
}

function copyToClipboard(hex) {
  const el = document.createElement('textarea');
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  //Pop Up Animation
  const popUpBox = popUp.children[0];
  popUp.classList.add('active');
  popUpBox.classList.add('active');
  console.log(popUp);
}

function openAdjust(index) {
 
  sliderContainers[index].classList.toggle('active');
  console.log(sliderContainers[index]);
  
}

function closeAdjust(index) {
  sliderContainers[index].classList.remove('active');
  console.log(closeAdjustments[index]);
}

function locked(lock, index) {
  lock.classList.toggle('locked');
  if (lock.classList.contains('locked')) {
    colorDivs[index].classList.add('locked');
    lock.innerHTML = ('<i class="fas fa-lock"></i>');
  } else {
    lock.innerHTML = ('<i class="fas fa-lock-open"></i>');
    colorDivs[index].classList.remove('locked');
  }
}
//Implement Save to pallete and LOCAL STORAGE STUFF
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submitSave');
const closeSave = document.querySelector('.closeSave');
const saveContainer = document.querySelector('.saveContainer');
const saveInput = document.querySelector('.saveContainer input');
const libraryContainer = document.querySelector('.libraryContainer'); 
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.closeLibrary');

//Event Listeners
saveBtn.addEventListener('click', openPalette);
submitSave.addEventListener('click', () => {
  savePalette();
})
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);
//Functions

function openPalette(event) {
  const popUp = saveContainer.children[0];
  saveContainer.classList.add('active');
  popUp.classList.add('active');
  console.log(event);
  closeSave.addEventListener('click', () => {
    if (saveContainer.classList.contains('active') && popUp.classList.contains('active')) {
      saveContainer.classList.remove('active') && popUp.classList.remove('active');
    }
  })
}

function savePalette() {
 
  saveContainer.classList.remove('active') && popUp.classList.remove('active');
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach(hex => {
    colors.push(hex.innerText);
    // localStorage.setItem(name, JSON.stringify(colors));
    // localColors = JSON.parse(localStorage.getItem(name));
    
  })
  //Generate Object
  let paletteNumber;
  const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
  if (paletteObjects) {
    paletteNumber = paletteObjects.length;
  } else {
    paletteNumber = savedPalettes.length;
}

  const paletteObj = { name, colors, number: paletteNumber };
  savedPalettes.push(paletteObj);
  // console.log(savedPalettes);
  //Save to localStorage
  saveToLocal(paletteObj);
  saveInput.value = ('');
  //Generate the palette for the Library
  const palette = document.createElement('div');
  palette.classList.add('customPalette');
  const title = document.createElement('h4');
  title.innerText = paletteObj.name;
  const preview = document.createElement('div');
  preview.classList.add('smallPreview');
  paletteObj.colors.forEach(smallColor => {
    const smallDiv = document.createElement('div');
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  })
  const paletteBtn = document.createElement('button');
  paletteBtn.classList.add('pickPaletteBtn');
  paletteBtn.classList.add(paletteObj.number);
  paletteBtn.innerText = 'Select';

  //Attach event to the btn
  palette.addEventListener('click', event => {
    const paletteIndex = event.target.classList[1];
    console.log(paletteIndex);
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    })
    resetInputs();
  })

  //Append to Library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  
  let localPalettes;
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem('palettes'));
    console.log('got it!')
  }
  localPalettes.push(paletteObj);
  localStorage.setItem('palettes', JSON.stringify(localPalettes));
  console.log(localPalettes);
 
}

function openLibrary() {

  const popUp = libraryContainer.children[0];
  
  libraryContainer.classList.add('active');
  popUp.classList.add('active');
}

function closeLibrary() {
  const popUp = libraryContainer.children[0];
  libraryContainer.classList.remove('active');
  popUp.classList.remove('active');
}

function getLocal() {
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    savedPalettes = [...paletteObjects];
    paletteObjects.forEach(paletteObj => {
     
      //Generate the palette for the Library
      const palette = document.createElement('div');
      palette.classList.add('customPalette');
      const title = document.createElement('h4');
      title.innerText = paletteObj.name;
      const preview = document.createElement('div');
      preview.classList.add('smallPreview');
      paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      })
      const paletteBtn = document.createElement('button');
      paletteBtn.classList.add('pickPaletteBtn');
      paletteBtn.classList.add(paletteObj.number);
      paletteBtn.innerText = 'Select';

      //Attach event to the btn
      palette.addEventListener('click', event => {
        const paletteIndex = event.target.classList[1];
        console.log(paletteIndex);
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        })
        resetInputs();
      })

      //Append to Library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
}
}
// localStorage.clear();
getLocal()


randomColors();
