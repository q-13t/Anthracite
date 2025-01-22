class WindowsParams {
    id: number;
    title: string;
    x: number;
    y: number;    
    x_prev: number;
    y_prev: number;    
    width: number;
    height: number;
    height_prev: number;
    width_prev: number;
    maximized: boolean;
    visible: boolean;
    zIndex: number;

    constructor(id:number, title:string, x:number, y:number, width:number, height:number,zIndex:number) {
        this.id = id;
        this.title = title;
        this.x = x;
        this.y = y;
        this.x_prev = x;
        this.y_prev = y;
        this.width = width;
        this.height_prev= height;
        this.height= height;
        this.width_prev = width;
        this.maximized  = false;
        this.visible = true;
        this.zIndex = zIndex;
    }

    setMaximized(bool: boolean) {
        this.maximized = bool;
    }

    setX (x:number) {
        this.x = x;
    }

    setY (y:number) {
        this.y = y; 
    }
}
export default WindowsParams;
