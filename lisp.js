const globalEnv = {
  '+': input => input.reduce((a, b) => a + b),
  '-': input => input.length === 1 ? -1 * input[0] : input.reduce((a, b) => a - b),
  '*': input => input.reduce((a, b) => a * b),
  '/': input => input.reduce((a, b) => a / b)
}

const numberParser = (inputExp, match = null) => (match = inputExp.match(/^-?(0|[1-9][0-9]*)(\.[0-9]+)?((e|E)(-|\+)?[0-9]+)?/)) === null ? null : [match[0] * 1, inputExp.slice(match[0].length).trim()]

const operatorParser = (inputExp, env) => {
  if (env[inputExp[0]] === undefined) return null
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
  return [env[operator](operands), inputExp]
}

const expressionParser = inputExp => {
  if (!inputExp.startsWith('(')) return null
  inputExp = inputExp.slice(1).trim()
  const result = operatorParser(inputExp, globalEnv)
  if (!result) return null
  return result
}

const specialFormParser = inputExp => {
  return null
}

const evaluator = inputExp => {
  inputExp = inputExp.trim()
  let result = specialFormParser(inputExp) || expressionParser(inputExp)
  if (result) return result
  result = numberParser(inputExp)
  if (!result) return null
  return result
}

const lispEval = inputExp => {
  const result = evaluator(inputExp)
  if (!result) return 'Invalid Expression'
  if (result[1].length === 0) return result[0]
  return lispEval(result[1])
}

const input = '( + 1 2 3 ( - 1 2 3 ))'
console.log(lispEval(input))