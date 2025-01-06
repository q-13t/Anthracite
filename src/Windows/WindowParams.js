class WindowsParams {
    constructor(id, title, x, y, width, height,zIndex) {
        this.id = id;
        this.title = title;
        this.x = x;
        this.y = y;
        this.x_prev = x;
        this.y_prev = y;
        this.width = width;
        this.height_prev= height;
        this.height = height;
        this.width_prev = width;
        this.maximized = false;
        this.visible = true;
        this.zIndex = zIndex;
    }

    setMaximized(bool) {
        this.maximized = bool;
    }

    setX (x) {
        this.x = x;
    }

    setY (y) {
        this.y = y; 
    }
}
export default WindowsParams;
