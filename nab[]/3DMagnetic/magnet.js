// script.js
let l = 100; // magnet length
let w = 40; // magnet width
let poleStrength = 100;
let delta = 1; // small offset from pole
let ds = 2; // step size
let maxSteps = 200;
let numAngles = 12; // number of lines around
let radii = [2, 6, 10]; // different starting radii for layered lines

let northPole = [0, l / 2, 0];
let southPole = [0, -l / 2, 0];

function getB(x, y, z) {
    // B from north pole (+)
    let rxn = x - northPole[0];
    let ryn = y - northPole[1];
    let rzn = z - northPole[2];
    let rn = Math.sqrt(rxn * rxn + ryn * ryn + rzn * rzn);
    let Bn = (rn === 0) ? [0, 0, 0] : [
        poleStrength * rxn / (rn * rn * rn),
        poleStrength * ryn / (rn * rn * rn),
        poleStrength * rzn / (rn * rn * rn)
    ];

    // B from south pole (-)
    let rxs = x - southPole[0];
    let rys = y - southPole[1];
    let rzs = z - southPole[2];
    let rs = Math.sqrt(rxs * rxs + rys * rys + rzs * rzs);
    let Bs = (rs === 0) ? [0, 0, 0] : [
        -poleStrength * rxs / (rs * rs * rs),
        -poleStrength * rys / (rs * rs * rs),
        -poleStrength * rzs / (rs * rs * rs)
    ];

    return [Bn[0] + Bs[0], Bn[1] + Bs[1], Bn[2] + Bs[2]];
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);
}

function draw() {
    background(255);
    orbitControl(); // Allow user to rotate view

    // Draw magnet
    // Red north pole (top)
    push();
    translate(0, l / 4, 0);
    fill(255, 0, 0);
    noStroke();
    box(w, l / 2, w);
    pop();

    // White south pole (bottom)
    push();
    translate(0, -l / 4, 0);
    fill(255);
    noStroke();
    box(w, l / 2, w);
    pop();

    // Draw field lines
    stroke(0);
    strokeWeight(1);
    noFill();

    for (let r of radii) {
        for (let a = 0; a < numAngles; a++) {
            let theta = a * TWO_PI / numAngles;
            let startX = r * cos(theta);
            let startZ = r * sin(theta);
            let pos = [startX, northPole[1] + delta, startZ];

            beginShape();
            vertex(pos[0], pos[1], pos[2]);

            for (let step = 0; step < maxSteps; step++) {
                let B = getB(pos[0], pos[1], pos[2]);
                let mag = Math.sqrt(B[0] * B[0] + B[1] * B[1] + B[2] * B[2]);
                if (mag === 0) break;

                let dirX = B[0] / mag * ds;
                let dirY = B[1] / mag * ds;
                let dirZ = B[2] / mag * ds;

                pos[0] += dirX;
                pos[1] += dirY;
                pos[2] += dirZ;

                vertex(pos[0], pos[1], pos[2]);

                // Stop conditions
                let distToSouth = Math.sqrt(
                    (pos[0] - southPole[0]) ** 2 +
                    (pos[1] - southPole[1]) ** 2 +
                    (pos[2] - southPole[2]) ** 2
                );
                if (distToSouth < 10) break;

                let distFromOrigin = Math.sqrt(pos[0] ** 2 + pos[1] ** 2 + pos[2] ** 2);
                if (distFromOrigin > 500) break;
            }
            endShape();
        }
    }
}