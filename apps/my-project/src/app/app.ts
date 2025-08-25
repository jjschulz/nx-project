import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { Hero } from '@my-project/ui';

@Component({
  imports: [NxWelcome, RouterModule, Hero],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit{
  protected title = 'my-project';
  private drawing=false;
  @ViewChild('myCanvas', {static:false}) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private pushArray: string[] = [];
  private step=-1;
  private mode="";
  constructor() {}

  //due to various things this function is unfortunately the largest thing ever
  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext("2d")!;
    const upload = document.getElementById('upload') as HTMLInputElement;
    const image=upload.addEventListener('change', (e:Event) =>{
      const file=(e.target as HTMLInputElement).files?.[0];
      if(!file) return;
      this.pushArray.length=0;
      this.step=-1;
      const img = new Image();
      img.onload=()=>{
        this.ctx.clearRect(0,0,canvas.width,canvas.height);
        this.ctx.drawImage(img,0,0,canvas.width,canvas.height);
        this.cpush(canvas);
      }
      img.src=URL.createObjectURL(file);
      return img;
    });
    const img = new Image();
    img.src = '../red-arrow-2.png';
    let textX = 0;
    let textY = 0;
    let currentText = "";
    const hiddenInput = document.getElementById("hiddenInput") as HTMLInputElement;
    const startDrawingMouse = (e: MouseEvent) => this.startDraw(e, canvas);
    const startDrawingTouch = (e: TouchEvent) => this.startDraw(e, canvas);
    const stopDrawingMouse = ()=>this.stopDraw(canvas);
    const drawMouse = (e: MouseEvent)=>this.draw(e, 3, canvas);
    const drawTouch = (e: TouchEvent)=>this.draw(e, 3, canvas);
    const arrowListener=(event: MouseEvent)=> {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            this.ctx.drawImage(img, x-50, y-50);
            console.log('image drawn');
            this.cpush(canvas)
        };

    const textListener=function(event: MouseEvent) {
      textX = event.clientX - canvas.getBoundingClientRect().left;
      textY = event.clientY - canvas.getBoundingClientRect().top;
      hiddenInput!.style.left = textX + "px";
      hiddenInput!.style.top = textY + "px";
      hiddenInput!.style.width = "100px"; 
      hiddenInput!.style.height = "20px"; 
      hiddenInput!.style.opacity = '1'; 

      hiddenInput!.focus();
      hiddenInput!.value = ''; 
    };
    const freedrawButton=document.getElementById('freedraw');
    freedrawButton?.addEventListener('click', ()=>{
      console.log('mode:', this.mode);
      this.removeAllEventListeners(canvas, startDrawingMouse, startDrawingTouch, stopDrawingMouse, drawMouse, drawTouch, arrowListener, textListener);
      canvas.addEventListener('mousedown', startDrawingMouse);
      canvas.addEventListener('mousemove', drawMouse);
      canvas.addEventListener('mouseup', stopDrawingMouse);
      canvas.addEventListener('mouseleave', stopDrawingMouse);
      canvas.addEventListener('touchstart', startDrawingTouch);
      canvas.addEventListener('touchmove', drawTouch);
      canvas.addEventListener('touchend', stopDrawingMouse);
    });
    ////////////////////////

    const arrowButton=document.getElementById('arrow');
    arrowButton?.addEventListener('click',()=>{
      this.removeAllEventListeners(canvas, startDrawingMouse, startDrawingTouch, stopDrawingMouse, drawMouse, drawTouch, arrowListener, textListener);
      // img.onload = ()=> {
        canvas.addEventListener('click', arrowListener);
    // };
      // this.addArrow(this.ctx, arrowListener, img);
    });
    ///////////////////////

    const textButton=document.getElementById('text');
    textButton?.addEventListener('click',()=>{
      this.removeAllEventListeners(canvas, startDrawingMouse, startDrawingTouch, stopDrawingMouse, drawMouse, drawTouch, arrowListener, textListener);
      canvas.addEventListener("click", textListener);

      hiddenInput!.addEventListener("input", ()=> {
        currentText = hiddenInput!.value;
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(currentText, textX, textY + 15); 
      });

      hiddenInput!.addEventListener("keydown", (event)=> {
        if (event.key === "Enter") {
          hiddenInput.style.opacity = '0';
          hiddenInput!.blur(); 
          this.cpush(canvas);
        }
      });
        // this.addText(this.ctx, textListener);
    });
    ///////////////////////

    const saveButton=document.getElementById('saveButton');
    saveButton?.addEventListener('click', ()=>{
      this.saveCanvas(canvas);
    });
    const undoButton=document.getElementById('undoButton');
    undoButton?.addEventListener('click', ()=>{
      this.undo(this.ctx, image);
    });
    const redoButton=document.getElementById('redoButton');
    redoButton?.addEventListener('click', ()=>{
      this.redo(this.ctx);
    });
    const saveResized=document.getElementById('saveResized');
    saveResized?.addEventListener('click', ()=>{
      this.saveResized(canvas);
    });
    const saveOverlay=document.getElementById('saveOverlay');
    saveOverlay?.addEventListener('click', ()=>{
      this.saveAsOverlay(canvas);
    });
  }

  startDraw(e: MouseEvent | TouchEvent, canvas: any){
    this.drawing=true;
    this.ctx?.beginPath();
    let clientX: number, clientY: number;
    if('touches' in e){
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      const rect = canvas.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;
      this.ctx?.moveTo(offsetX, offsetY);

    }else{
      this.ctx?.moveTo(e.offsetX,e.offsetY);
    }
  }

  draw(e:MouseEvent | TouchEvent, width: number, canvas: any){
    if(!this.drawing) return;
   
    let clientX: number, clientY: number;
    if ('touches' in e) { 
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
    } else { 
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const rect = canvas.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    const colorPicker=document.getElementById('colorPicker') as HTMLInputElement;
    this.ctx?.lineTo(offsetX, offsetY);
    this.ctx!.strokeStyle=colorPicker.value;
    this.ctx!.lineWidth=width;
    this.ctx?.stroke();
  }

  stopDraw(canvas: any){
    this.drawing=false;
    this.ctx?.closePath();
    this.cpush(canvas);
  }

  saveCanvas(canvas: any){
    const dataurl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href=dataurl;
    link.download='drawing.png';
    link.click()

  }

  saveAsOverlay(canvas: HTMLCanvasElement) {
    if (this.pushArray.length < 2) {
        console.error('No drawings to save as overlay.');
        return;
    }
    const backgroundPromise = new Promise(resolve => {
        const bgImg = new Image();
        bgImg.onload = () => resolve(bgImg);
        bgImg.src = this.pushArray[0];
    });
    const finalPromise = new Promise(resolve => {
        const finalImg = new Image();
        finalImg.onload = () => resolve(finalImg);
        finalImg.src = this.pushArray[this.step];
    });
    Promise.all([backgroundPromise, finalPromise]).then(([bgImg, finalImg]) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d')!;
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = canvas.width;
        bgCanvas.height = canvas.height;
        const bgCtx = bgCanvas.getContext('2d')!;
        bgCtx.drawImage(bgImg as CanvasImageSource, 0, 0);
        const bgData = bgCtx.getImageData(0, 0, canvas.width, canvas.height).data;
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const finalCtx = finalCanvas.getContext('2d')!;
        finalCtx.drawImage(finalImg as CanvasImageSource, 0, 0);
        const finalData = finalCtx.getImageData(0, 0, canvas.width, canvas.height);
        const finalPixels = finalData.data;
        for (let i = 0; i < finalPixels.length; i += 4) {
            if (
                finalPixels[i] === bgData[i] &&
                finalPixels[i+1] === bgData[i+1] &&
                finalPixels[i+2] === bgData[i+2] &&
                finalPixels[i+3] === bgData[i+3]
            ) {
                finalPixels[i+3] = 0;
            }
        }
        tempCtx.putImageData(finalData, 0, 0);
        const dataurl = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataurl;
        link.download = 'overlay.png';
        link.click();
    });
}

  saveResized(canvas:any){
    //save scaled image
    const imgWidthInput = document.getElementById('imgWidth') as HTMLInputElement;
    const imgHeightInput = document.getElementById('imgHeight') as HTMLInputElement;
    const newWidth = parseInt(imgWidthInput.value);
    const newHeight = parseInt(imgHeightInput.value);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    const tempCtx = tempCanvas.getContext('2d');

    const canvasPic= new Image();
    canvasPic.src=this.pushArray[this.step];
    canvasPic.onload = () => {
      tempCtx!.drawImage(canvasPic, 0, 0, newWidth, newHeight);
      const dataURL = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'resized_image.png'; 
      link.href = dataURL;
      link.click();
    };
  }

  cpush(canvas:HTMLCanvasElement){
    this.step++;
    if (this.step < this.pushArray.length){
      this.pushArray.length=this.step;
    }
    const dataURL = canvas.toDataURL();
    this.pushArray.push(dataURL);
    console.log(this.pushArray);
  }

  undo(ctx: CanvasRenderingContext2D, image: any){
    console.log('this st3p before undo:', this.step)
    if (this.step>0){
      //this.pushArray.splice(this.step, 1);
      this.step--;
      const canvasPic= new Image();
      canvasPic.src=this.pushArray[this.step];
      canvasPic.onload=function(){ctx.drawImage(canvasPic,0,0, ctx.canvas.width, ctx.canvas.height);}
    }
    console.log('array on undo:', this.pushArray);
    console.log('this st3p after undo:', this.step)

  }

  redo(ctx: CanvasRenderingContext2D){
    if(this.step<this.pushArray.length-1){
      this.step++;
      const canvasPic=new Image();
      canvasPic.src=this.pushArray[this.step];
      canvasPic.onload=function(){ctx.drawImage(canvasPic,0,0);}
    }
  }

  removeAllEventListeners(canvas: any, startDrawingMouse: any, startDrawingTouch: any, stopDrawingMouse: any, drawMouse:any, drawTouch:any, arrowListener: any, textListener: any){
    canvas.removeEventListener('mousedown', startDrawingMouse);
    canvas.removeEventListener('mousemove', drawMouse);
    canvas.removeEventListener('mouseup', stopDrawingMouse);
    canvas.removeEventListener('mouseleave', stopDrawingMouse);
    canvas.removeEventListener('touchstart', startDrawingTouch);
    canvas.removeEventListener('touchmove', drawTouch);
    canvas.removeEventListener('touchend', stopDrawingMouse);
    canvas.removeEventListener('click', arrowListener);
    canvas.removeEventListener('click', textListener);

  }

}
