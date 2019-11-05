const globalEnv = {
  '+': input => input.reduce((a, b) => a + b),
  '-': input => input.length === 1 ? -1 * input[0] : input.reduce((a, b) => a - b),
  '*': input => input.reduce((a, b) => a * b),
  '/': input => input.reduce((a, b) => a / b)
}

const numberParser = (inputExp, match = null) => (match = inputExp.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?((e|E)(-|\+)?[0-9]+)?/)) === null ? null : [match[0] * 1, inputExp.slice(match[0].length).trim()]

const identifierParser = (inputExp, match = null) => (match = inputExp.match(/^[a-zA-Z]*/)) === null ? null : [match[0], inputExp.slice(match[0].length).trim()]

const findInEnv = variable => globalEnv[variable] === undefined ? null : globalEnv[variable]

const operatorParser = (inputExp) => {
  if (globalEnv[inputExp[0]] === undefined) return null
  const operator = inputExp[0]
  inputExp = inputExp.slice(1).trim()
  const operands = []
  while (inputExp[0] !== ')') {
    const result = evaluator(inputExp)
    if (!result) return null
    operands.push(result[0])
    inputExp = result[1]
  }
  if (!inputExp[0].startsWith(')')) return null
  inputExp = inputExp.slice(1).trim()
  return [globalEnv[operator](operands), inputExp]
}

const defineParser = inputExp => {
  if (!inputExp.startsWith('define')) return null
  inputExp = inputExp.slice(6).trim()
  const varName = inputExp.slice(0, inputExp.indexOf(' ')).trim()
  const checkVar = identifierParser(varName)
  if (!checkVar) return null
  if (checkVar[0] !== varName) return null
  inputExp = inputExp.slice(varName.length).trim()
  const varValue = numberParser(inputExp)
  if (!varValue) return null
  inputExp = varValue[1]
  if (!inputExp.startsWith(')')) return null
  globalEnv[varName] = varValue[0]
  inputExp = inputExp.slice(1)
  return [varName, inputExp]
}

const expressionParser = inputExp => {
  if (!inputExp.startsWith('(')) return null
  inputExp = inputExp.slice(1).trim()
  const result = operatorParser(inputExp)
  if (!result) return null
  return result
}

const specialFormParser = inputExp => {
  if (!inputExp.startsWith('(')) return null
  inputExp = inputExp.slice(1).trim()
  const result = defineParser(inputExp)
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

const input = '(define ak 100) (* ak ak)'
console.log(lispEval(input))
console.log(globalEnv)