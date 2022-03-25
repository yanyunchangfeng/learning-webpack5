import png from 'src/assets/img/yanyunchangfeng.png';
import 'src/app/lesson1';
import('src/app/lesson2');
import 'src/app/lesson3';
import { fn1 } from 'src/app/lesson4'
import 'src/app/lesson6'
import 'src/app/lesson7'
import 'src/app/lesson7/style'
import 'src/app/lesson10'
import 'src/app/lesson12'
import { foo } from 'src/app/lesson11'
console.log('foo', foo)
console.log('fn1', fn1)
console.log('process.env.NODE_ENV', process.env.NODE_ENV)
console.log('AUTHOR', AUTHOR)
import TreeShaking from 'src/app/lesson8'
import 'src/app/lesson9'
const tree = new TreeShaking()
console.log('yanyunchagnfeng png', png)
let start: any = null;
let element: any = document.querySelector('div');
// const step = (timestamp: any) => {
//     if (!start) start = timestamp;
//     console.log(timestamp, 'timestamp')
//     let progress = timestamp - start;
//     console.log(progress, 'progress')
//     let styleLeft = Math.min(progress / 10, 200)
//     element.style.left = styleLeft + 'px';
//     console.log(styleLeft, 'styleLeft')
//     if (progress < 2000) {
//         window.requestAnimationFrame(step);
//     }
// }

// window.requestAnimationFrame(step);
/*
window.addEventListener("load", async () => {
    let { instance } = await WebAssembly.instantiateStreaming(
        fetch("wasm/dip.wasm")
    );
    // let {
    //     cppConvFilter,
    //     cppGetkernelPtr,
    //     cppGetDataPtr,
    //     memory,
    // } = instance.exports;
    const cppConvFilter = instance.exports.cppConvFilter as CallableFunction
    const cppGetkernelPtr = instance.exports.cppGetkernelPtr as CallableFunction
    const cppGetDataPtr = instance.exports.cppGetDataPtr as CallableFunction
    const memory = instance.exports.memory as any
    console.log(cppConvFilter, 'cppConvFilter')
    console.log(cppGetkernelPtr, 'cppGetkernelPtr')
    console.log(cppGetDataPtr, 'cppGetDataPtr')
    console.log(memory, 'memory')


    const STATUS = ["STOP", "JS", "WASM"];
    let globalStatus = "STOP";

    // listeners.
    document.querySelector("button").addEventListener("click", () => {
        globalStatus =
            STATUS[
            Number((document.querySelector("input[name='options']:checked") as any).value)
            ];
    });

    // variable and parameters.
    var fpsNumDisplayElement = document.querySelector(".fps-num");
    var jsTimeRecords: any = [],
        wasmTimeRecords = [];
    var clientX, clientY;

    function flipKernel(kernel) {
        const h = kernel.length;
        const half = Math.floor(h / 2);
        for (let i = 0; i < half; ++i) {
            for (let j = 0; j < h; ++j) {
                let _t = kernel[i][j];
                kernel[i][j] = kernel[h - i - 1][h - j - 1];
                kernel[h - i - 1][h - j - 1] = _t;
            }
        }
        if (h & 1) {
            for (let j = 0; j < half; ++j) {
                let _t = kernel[half][j];
                kernel[half][j] = kernel[half][h - j - 1];
                kernel[half][h - j - 1] = _t;
            }
        }
        return kernel;
    }

    // filters related stuff.
    const kernel = flipKernel([
        [-1, -1, 1],
        [-1, 14, -1],
        [1, -1, -1],
    ]);

    // convex function (JS version).
    function jsConvFilter(data, width, height, kernel) {
        const divisor = 4;
        const h = kernel.length,
            w = h;
        const half = Math.floor(h / 2);

        // picture iteration.
        for (let y = half; y < height - half; ++y) {
            for (let x = half; x < width - half; ++x) {
                const px = (y * width + x) * 4; // pixel index.
                let r = 0,
                    g = 0,
                    b = 0;
                // core iteration.
                for (let cy = 0; cy < h; ++cy) {
                    for (let cx = 0; cx < w; ++cx) {
                        // dealing edge case.
                        const cpx = ((y + (cy - half)) * width + (x + (cx - half))) * 4;

                        r += data[cpx + 0] * kernel[cy][cx];
                        g += data[cpx + 1] * kernel[cy][cx];
                        b += data[cpx + 2] * kernel[cy][cx];
                    }
                }
                data[px + 0] =
                    r / divisor > 255 ? 255 : r / divisor < 0 ? 0 : r / divisor;
                data[px + 1] =
                    g / divisor > 255 ? 255 : g / divisor < 0 ? 0 : g / divisor;
                data[px + 2] =
                    b / divisor > 255 ? 255 : b / divisor < 0 ? 0 : b / divisor;
            }
        }
        return data;
    }

    // filters functions.
    const dataOffset = cppGetDataPtr();
    const kernOffset = cppGetkernelPtr();

    const flatKernel = kernel.reduce((acc, cur) => acc.concat(cur), []);
    let Uint8View = new Uint8Array(memory.buffer);
    let Int8View = new Int8Array(memory.buffer);
    Int8View.set(flatKernel, kernOffset);

    function filterWasm(pixelData, width, height) {
        const arLen = pixelData.length;

        Uint8View.set(pixelData, dataOffset);

        // core.
        cppConvFilter(width, height, 4);

        // retrieve data.
        return Uint8View.subarray(dataOffset, dataOffset + arLen);
    }

    // fileters (JS polyfill).
    function filterJS(pixelData, width, height) {
        return jsConvFilter(pixelData, width, height, kernel);
    }

    function calcFPS(vector) {
        const AVERAGE_RECORDS_COUNT = 20;
        if (vector.length > AVERAGE_RECORDS_COUNT) {
            vector.shift(-1);
        } else {
            return "NaN";
        }
        let averageTime =
            vector.reduce((pre, item) => {
                return pre + item;
            }, 0) / Math.abs(AVERAGE_RECORDS_COUNT);
        return (1000 / averageTime).toFixed(2);
    }

    // the main process.
    let video: HTMLVideoElement = document.querySelector(".video");
    let canvas: HTMLCanvasElement = document.querySelector(".canvas");

    // get a canvas context2D.
    let context2D = canvas.getContext("2d");

    // autoplay the video.
    let promise = video.play();
    if (promise !== undefined) {
        promise.catch((error) => {
            console.error("Can not autoplay!");
        });
    }

    // drawing function.
    function draw() {
        // record performance.
        const timeStart = performance.now();

        // render the first frame from the top-left of the canvas.
        context2D.drawImage(video, 0, 0);

        // get current video data.
        let pixels = context2D.getImageData(0, 0, video.videoWidth, video.videoHeight);

        switch (globalStatus) {
            case "JS": {
                pixels.data.set(filterJS(pixels.data, clientX, clientY));
                break;
            }
            case "WASM": {
                pixels.data.set(filterWasm(pixels.data, clientX, clientY));
                break;
            }
        }

        // append image onto the canvas.
        context2D.putImageData(pixels, 0, 0);

        let timeUsed = performance.now() - timeStart;

        // update frame number.
        switch (globalStatus) {
            case "JS": {
                jsTimeRecords.push(timeUsed);
                fpsNumDisplayElement.innerHTML = calcFPS(jsTimeRecords);
                break;
            }
            case "WASM": {
                wasmTimeRecords.push(timeUsed);
                fpsNumDisplayElement.innerHTML = calcFPS(wasmTimeRecords);
                break;
            }
            default:
                wasmTimeRecords.push(timeUsed);
                fpsNumDisplayElement.innerHTML = calcFPS(wasmTimeRecords);
        }

        // continue.
        requestAnimationFrame(draw);
    }

    // init canvas.
    video.addEventListener("loadeddata", () => {
        // set the size of current stage.
        canvas.setAttribute("height", String(video.videoHeight));
        canvas.setAttribute("width", String(video.videoWidth));

        // get the drawing size of the stage.
        clientX = canvas.clientWidth;
        clientY = canvas.clientHeight;

        // start drawing!
        draw();
    });

});
*/