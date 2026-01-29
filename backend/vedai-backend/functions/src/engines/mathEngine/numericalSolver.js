/**
 * Layer 5: Numerical Engine
 * For approximations and numerical methods
 */

/**
 * Newton-Raphson method for root finding
 */
function newtonRaphson(f, fPrime, x0, tolerance = 1e-6, maxIterations = 100) {
  const steps = [];
  let x = x0;
  
  steps.push(`Starting Newton-Raphson with x₀ = ${x0}`);
  
  for (let i = 0; i < maxIterations; i++) {
    const fx = f(x);
    const fpx = fPrime(x);
    
    if (Math.abs(fpx) < 1e-10) {
      return { 
        success: false, 
        error: 'Derivative too small', 
        iterations: i 
      };
    }
    
    const xNew = x - fx / fpx;
    steps.push(`Iteration ${i + 1}: x = ${x.toFixed(6)}, f(x) = ${fx.toFixed(6)}, x_new = ${xNew.toFixed(6)}`);
    
    if (Math.abs(xNew - x) < tolerance) {
      return {
        success: true,
        root: xNew,
        iterations: i + 1,
        steps: steps,
        method: 'newton_raphson'
      };
    }
    
    x = xNew;
  }
  
  return { 
    success: false, 
    error: 'Max iterations reached', 
    lastValue: x,
    steps: steps 
  };
}

/**
 * Bisection method for root finding
 */
function bisectionMethod(f, a, b, tolerance = 1e-6, maxIterations = 100) {
  const steps = [];
  
  if (f(a) * f(b) >= 0) {
    return { 
      success: false, 
      error: 'Function must have opposite signs at endpoints' 
    };
  }
  
  steps.push(`Starting Bisection Method with [${a}, ${b}]`);
  
  let left = a;
  let right = b;
  
  for (let i = 0; i < maxIterations; i++) {
    const mid = (left + right) / 2;
    const fMid = f(mid);
    
    steps.push(`Iteration ${i + 1}: [${left.toFixed(6)}, ${right.toFixed(6)}], mid = ${mid.toFixed(6)}, f(mid) = ${fMid.toFixed(6)}`);
    
    if (Math.abs(fMid) < tolerance) {
      return {
        success: true,
        root: mid,
        iterations: i + 1,
        steps: steps,
        method: 'bisection'
      };
    }
    
    if (f(left) * fMid < 0) {
      right = mid;
    } else {
      left = mid;
    }
    
    if (Math.abs(right - left) < tolerance) {
      return {
        success: true,
        root: (left + right) / 2,
        iterations: i + 1,
        steps: steps,
        method: 'bisection'
      };
    }
  }
  
  return { 
    success: false, 
    error: 'Max iterations reached',
    steps: steps 
  };
}

/**
 * Numerical integration using Simpson's rule
 */
function simpsonsRule(f, a, b, n = 100) {
  if (n % 2 !== 0) n++; // Must be even
  
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += f(x) * (i % 2 === 0 ? 2 : 4);
  }
  
  const result = (h / 3) * sum;
  
  return {
    success: true,
    result: result,
    method: 'simpsons_rule',
    intervals: n,
    interval: `[${a}, ${b}]`,
    steps: [
      `Using Simpson's Rule with ${n} intervals`,
      `h = (${b} - ${a}) / ${n} = ${h}`,
      `∫f(x)dx ≈ ${result.toFixed(6)}`
    ]
  };
}

/**
 * Trapezoidal rule for numerical integration
 */
function trapezoidalRule(f, a, b, n = 100) {
  const h = (b - a) / n;
  let sum = (f(a) + f(b)) / 2;
  
  for (let i = 1; i < n; i++) {
    sum += f(a + i * h);
  }
  
  const result = h * sum;
  
  return {
    success: true,
    result: result,
    method: 'trapezoidal_rule',
    intervals: n,
    steps: [
      `Using Trapezoidal Rule with ${n} intervals`,
      `∫f(x)dx ≈ ${result.toFixed(6)}`
    ]
  };
}

/**
 * Euler's method for ODEs
 */
function eulersMethod(f, x0, y0, xEnd, h = 0.1) {
  const steps = [];
  const points = [];
  
  let x = x0;
  let y = y0;
  
  steps.push(`Starting Euler's Method: dy/dx = f(x,y), y(${x0}) = ${y0}`);
  points.push({ x, y });
  
  while (x < xEnd) {
    const slope = f(x, y);
    y = y + h * slope;
    x = x + h;
    
    points.push({ x: parseFloat(x.toFixed(6)), y: parseFloat(y.toFixed(6)) });
    
    if (points.length <= 10) {
      steps.push(`x = ${x.toFixed(4)}, y = ${y.toFixed(6)}`);
    }
  }
  
  return {
    success: true,
    finalValue: y,
    points: points,
    method: 'eulers_method',
    stepSize: h,
    steps: steps
  };
}

/**
 * Calculate numerical derivative
 */
function numericalDerivative(f, x, h = 1e-5) {
  // Central difference method
  const derivative = (f(x + h) - f(x - h)) / (2 * h);
  
  return {
    success: true,
    derivative: derivative,
    point: x,
    method: 'central_difference',
    steps: [
      `f'(${x}) ≈ [f(${x + h}) - f(${x - h})] / (2h)`,
      `f'(${x}) ≈ ${derivative.toFixed(6)}`
    ]
  };
}

/**
 * Monte Carlo simulation for probability
 */
function monteCarlo(experiment, trials = 10000) {
  let successes = 0;
  
  for (let i = 0; i < trials; i++) {
    if (experiment()) {
      successes++;
    }
  }
  
  const probability = successes / trials;
  
  return {
    success: true,
    probability: probability,
    successes: successes,
    trials: trials,
    method: 'monte_carlo',
    confidenceInterval: {
      margin: 1.96 * Math.sqrt(probability * (1 - probability) / trials),
      level: 0.95
    }
  };
}

module.exports = {
  newtonRaphson,
  bisectionMethod,
  simpsonsRule,
  trapezoidalRule,
  eulersMethod,
  numericalDerivative,
  monteCarlo
};
