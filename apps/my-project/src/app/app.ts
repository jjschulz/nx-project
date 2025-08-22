import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { Hero } from '@my-project/ui';
import { TouchedChangeEvent } from '@angular/forms';

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
    
    const freedrawButton=document.getElementById('freedraw');
    freedrawButton?.addEventListener('click', ()=>{
      console.log('mode:', this.mode);
      canvas.addEventListener('mousedown', (e) => this.startDraw(e, canvas));
      canvas.addEventListener('mousemove', (e)=>this.draw(e, 3, canvas));
      canvas.addEventListener('mouseup', ()=>this.stopDraw(canvas));
      canvas.addEventListener('mouseleave', ()=>this.stopDraw(canvas));
      canvas.addEventListener('touchstart', (e) => this.startDraw(e, canvas));
      canvas.addEventListener('touchmove', (e)=>this.draw(e, 3, canvas));
      canvas.addEventListener('touchend', ()=>this.stopDraw(canvas));
    });
    ////////////////////////

    const arrowButton=document.getElementById('arrow');
    arrowButton?.addEventListener('click',(e)=>{
      this.addArrow(this.ctx,e);
    });


    ///////////////////////

    const textButton=document.getElementById('text');
    textButton?.addEventListener('click',()=>{
        this.addText(this.ctx);
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

  saveAsOverlay(canvas:any){
    //save just the drawings and not the image
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

  addArrow(ctx: CanvasRenderingContext2D, e:MouseEvent){
    const img = new Image();
    img.src = '../red-arrow-2.png';
    img.onload = ()=> {
        ctx.canvas.addEventListener('click', (event)=> {
            const rect = ctx.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            ctx.drawImage(img, x-50, y-50);
            console.log('image drawn');
            this.cpush(ctx.canvas)
        });
    };
  }

  addText(ctx: CanvasRenderingContext2D){
    let currentText = "";
    let textX = 0;
    let textY = 0;
    const hiddenInput = document.getElementById("hiddenInput") as HTMLInputElement;

    ctx.canvas.addEventListener("click", function(event) {
      textX = event.clientX - ctx.canvas.getBoundingClientRect().left;
      textY = event.clientY - ctx.canvas.getBoundingClientRect().top;
      hiddenInput!.style.left = textX + "px";
      hiddenInput!.style.top = textY + "px";
      hiddenInput!.style.width = "100px"; 
      hiddenInput!.style.height = "20px"; 
      hiddenInput!.style.opacity = '1'; 

      hiddenInput!.focus();
      hiddenInput!.value = ''; 
    });

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
        this.cpush(ctx.canvas);
      }
    });
  }

  removeAllEventListeners(canvas: any){
    canvas.removeEventListener('mousedown', (e: MouseEvent) => this.startDraw(e, canvas));
    canvas.removeEventListener('mousemove', (e: MouseEvent)=>this.draw(e, 3, canvas));
    canvas.removeEventListener('mouseup', ()=>this.stopDraw(canvas));
    canvas.removeEventListener('mouseleave', ()=>this.stopDraw(canvas));
    canvas.removeEventListener('touchstart', (e:TouchEvent) => this.startDraw(e, canvas));
    canvas.removeEventListener('touchmove', (e:TouchEvent)=>this.draw(e, 3, canvas));
    canvas.removeEventListener('touchend', ()=>this.stopDraw(canvas));

  }

}
