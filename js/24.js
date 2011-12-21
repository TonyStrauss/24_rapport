var OPERATORS = ['+', '-', '*', '/'];

Solution = function(operands, operators) {
    this.operands = operands.slice(0); // Clone
    this.operators = operators.slice(0); // Clone
};

Solution.prototype.toString = function() {
    var expression = "";
    var total = this.operands[0];

    for (var operatorCount = 0; operatorCount < this.operators.length; ++operatorCount) {
        if (operatorCount != 0) {
            expression += ", then ";
        }

        expression += total;
        expression += " ";
        expression += this.operators[operatorCount];
        expression += " ";
        expression += this.operands[operatorCount + 1];
        expression += " = ";
        total = evaluate(total, this.operands[operatorCount + 1], this.operators[operatorCount]);
        expression += total;
    }

    return expression;
};

Solution.prototype.elideSubtraction = function() {
    var newOperands = [];
    var newOperators = [];

    for (var operatorCount = 0; operatorCount < this.operators.length; ++operatorCount) {
        if (this.operators[operatorCount] == '-') {
            newOperands.push(this.operands[operatorCount] - this.operands[operatorCount + 1]);
        } else {
            newOperands.push(this.operands[operatorCount]);
            newOperators.push(this.operators[operatorCount]);
        }
    }

    if (this.operators[this.operators.length - 1] != '-') {
        newOperands.push(this.operands[ths.operands.length - 1]);
    }

    return new Solution(newOperands, newOperators);
};

function findSolutionsWith4Operands(operand1, operand2, operand3, operand4) {
    var solutions = findSolutions([operand1, operand2, operand3, operand4]);
    var solutionStrings = [];
    for (var solutionCount = 0; solutionCount < solutions.length; ++solutionCount) {
        solutionStrings.push(solutions[solutionCount].toString());
    }

    return solutionStrings;
}

function findSolutions(operands) {
    var solutions = [];
    var orderedOperands = operands.slice(0); // Clone

    for (var operandCount = 0; operandCount < operands.length; ++operandCount) {
        forEachPermutation(OPERATORS, function(operators) {
            if (isSolution(orderedOperands, operators)) {
                solutions.push(new Solution(orderedOperands, operators));
            }
        });

        orderedOperands.push(orderedOperands.shift()); // Rotate the array
    }

    return solutions;
}

function isSolution(operands, operators) {
    var total = operands[0];
    for (var operatorCount = 0; operatorCount < operators.length; ++operatorCount) {
        var operand = operands[operatorCount + 1];
        total = evaluate(total, operand, operators[operatorCount]);
    }

    return (total == 24);
}

function evaluate(operand1, operand2, operator) {
    switch (operator) {
        case '+':
            return operand1 + operand2;
        case '-':
            return operand1 - operand2;
        case '*':
            return operand1 * operand2;
        case '/':
            return operand1 / operand2;
    }
}

function forEachPermutation(items, block) {
    forEachPermutationImpl(items, [], block);
}

function forEachPermutationImpl(items, chosenItems, block) {
    if (chosenItems.length == items.length) {
        block.call(this, chosenItems);
    } else {
        for (var itemCount = 0; itemCount < items.length; ++itemCount) {
            var item = items[itemCount];
            chosenItems.push(item);
            forEachPermutationImpl(items, chosenItems, block);
            chosenItems.pop();
        }
    }
}
