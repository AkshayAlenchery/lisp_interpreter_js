const globalEnv = {
  '+': input => input.reduce((a, b) => a + b),
  '-': input => input.length === 1 ? -1 * input[0] : input.reduce((a, b) => a - b),
  '*': input => input.reduce((a, b) => a * b),
  '/': input => input.reduce((a, b) => a / b),
  '>': input => input.reduce((a, b) => a > b),
  '<': input => input.reduce((a, b) => a < b),
  '>=': input => input.reduce((a, b) => a >= b),
  '<=': input => input.reduce((a, b) => a <= b),
  '=': input => input.reduce((a, b) => a === b),
  'pi': Math.PI
}

const numberParser = (inputExp, match = null) => {
  if (inputExp.startsWith('(')) inputExp = inputExp.slice(1).trim()
  match = inputExp.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?((e|E)(-|\+)?[0-9]+)?/)
  if (match === null) return null
  return [match[0] * 1, inputExp.slice(match[0].length).trim()]
}

const identifierParser = (inputExp, match = null) => (match = inputExp.match(/^[a-zA-Z]*/)) === null ? null : [match[0], inputExp.slice(match[0].length).trim()]

const findInEnv = variable => globalEnv[variable] === undefined ? null : globalEnv[variable]

const skipParser = inputExp => {
  if (!inputExp.startsWith('(')) return null
  inputExp = inputExp.slice(1).trim()
  let count = 1
  let valid = '('
  while (count) {
    if (inputExp[0] === '(') count++
    if (inputExp[0] === ')') count--
    valid += inputExp[0]
    inputExp = inputExp.slice(1)
    if (count === 0) break
  }
  return [valid, inputExp.trim()]
}

const operatorParser = (inputExp) => {
  const operator = inputExp.slice(0, inputExp.indexOf(' '))
  if (globalEnv[operator] === undefined) return null
  if (typeof globalEnv[operator] === 'object') {
    inputExp = inputExp.slice(operator.length).trim()
  }
  inputExp = inputExp.slice(1).trim()
  const operands = []
  while (inputExp[0] !== ')') {
    const result = evaluator(inputExp)
    if (!result) return null
    operands.push(result[0])
    inputExp = result[1]
  }
  if (!inputExp[0].startsWith(')')) return null
  return [globalEnv[operator](operands), inputExp.slice(1).trim()]
}

const ifParser = inputExp => {
  if (!inputExp.startsWith('if')) return null
  inputExp = inputExp.slice(2).trim()
  const ifExpResult = evaluator(inputExp)
  if (!ifExpResult) return null
  inputExp = ifExpResult[1]
  if (ifExpResult[0]) {
    const result = evaluator(inputExp)
    if (!result) return null
    return [result[0], '']
  }
  inputExp = skipParser(inputExp)[1]
  if (inputExp.startsWith(')')) return ['', '']
  const result = evaluator(inputExp)
  if (!result) return null
  if (!result[1].startsWith(')')) return null
  return [result[0], result[1].slice(1).trim()]
}

const beginParser = inputExp => {
  if (!inputExp.startsWith('begin')) return null
  inputExp = inputExp.slice(5).trim()
  let result
  while (inputExp[0] !== ')') {
    result = evaluator(inputExp)
    if (!result) return null
    inputExp = result[1]
  }
  if (!inputExp.startsWith(')')) return null
  return [result[0], inputExp.slice(1).trim()]
}

const defineParser = inputExp => {
  if (!inputExp.startsWith('define')) return null
  inputExp = inputExp.slice(6).trim()
  const varName = inputExp.slice(0, inputExp.indexOf(' ')).trim()
  const checkVar = identifierParser(varName)
  if (!checkVar) return null
  if (checkVar[0] !== varName) return null
  inputExp = inputExp.slice(varName.length).trim()
  const varValue = evaluator(inputExp)
  if (!varValue) return null
  inputExp = varValue[1]
  if (!inputExp.startsWith(')')) return null
  globalEnv[varName] = varValue[0]
  return [varName, inputExp.slice(1)]
}

const quoteParser = inputExp => {
  if (!inputExp.startsWith('quote')) return null
  inputExp = inputExp.slice(5).trim()
  const result = skipParser(inputExp)
  if (!result) return null
  if (!result[1].startsWith(')')) return null
  return [result[0], result[1].slice(1).trim()]
}

const lambdaParser = inputExp => {
  if (!inputExp.startsWith('lambda')) return null
  inputExp = inputExp.slice(6).trim()
  if (!inputExp.startsWith('(')) return null
  inputExp = inputExp.slice(1).trim()
  const funcEnv = {}
  const params = []
  while (inputExp[0] !== ')') {
    const result = identifierParser(inputExp)
    if (!result) return null
    params.push(result[0])
    inputExp = result[1]
  }
  inputExp = inputExp.slice(1).trim()
  const expResult = skipParser(inputExp)
  if (!expResult) return null
  if (!expResult[1].startsWith(')')) return null
  funcEnv.params = params
  funcEnv.def = expResult[0]
  return [funcEnv, expResult[1].slice(1).trim()]
}

const expressionParser = inputExp => {
  if (!inputExp.startsWith('(')) return null
  inputExp = inputExp.slice(1).trim()
  const result = operatorParser(inputExp) || ifParser(inputExp) || beginParser(inputExp)
  if (!result) return null
  return result
}

const specialFormParser = inputExp => {
  if (!inputExp.startsWith('(')) return null
  inputExp = inputExp.slice(1).trim()
  const result = defineParser(inputExp) || quoteParser(inputExp) || lambdaParser(inputExp)
  if (!result) return null
  return result
}

const evaluator = inputExp => {
  inputExp = inputExp.trim()
  let result = specialFormParser(inputExp) || expressionParser(inputExp)
  if (result) return result
  result = numberParser(inputExp)
  if (result) return result
  result = identifierParser(inputExp)
  if (!result) return null
  const varVal = findInEnv(result[0])
  if (!varVal) return null
  return [varVal, result[1]]
}

const lispEval = inputExp => {
  const result = evaluator(inputExp)
  if (!result) return 'Invalid Expression'
  if (result[1].length === 0) return result[0]
  return lispEval(result[1])
}

const input = '(define circle (lambda (a b c) (* pi a b c)))'
console.log(lispEval(input))
console.log(globalEnv)
