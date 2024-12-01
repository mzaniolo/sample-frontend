export class Node_1 {
    constructor() {
        this.connections = [];
        this.visited = false;
    }
    evaluate(state, terminal) {
        if (!this.visited) {
            for (var [node, terminal] of this.connections) {
                node.evaluate(state, terminal)
            }
        }


    }
}
export class Node_2 {
    constructor(name) {
        this.name = name;
        this.connections_1 = [];
        this.connections_2 = [];
    }
    evaluate(state, terminal) {
        if (!this.visited) {
            this.visited = true;
            state[this.name].term_1 = false;
            state[this.name].term_2 = false;
            if (terminal == 1) {
                state[this.name].term_1 = true;
                this.#evaluate_1(state)
                if (state[this.name].close) {
                    this.#evaluate_2(state)
                    state[this.name].term_2 = true;
                }
            } else if (terminal == 2) {
                state[this.name].term_2 = true;
                this.#evaluate_2(state)
                if (state[this.name].close) {
                    this.#evaluate_1(state)
                    state[this.name].term_1 = true;
                }
            } else {
                console.error("node ", this.name, " got unknown terminal ", terminal)
            }
        }
    }
    #evaluate_1(state) {
        for (var [node, terminal] of this.connections_1) {
            node.evaluate(state, terminal)
        }
    }
    #evaluate_2(state) {
        for (var [node, terminal] of this.connections_2) {
            node.evaluate(state, terminal)
        }
    }
}

export class TopProc {
    constructor(nodes, main_node) {
        this.nodes = nodes;
        this.main_node = main_node;
    }

    calculate(new_state) {
        this.main_node.evaluate(new_state, 1)
        for (var node of this.nodes) {
            if (!node.visited && node.name != undefined) {
                new_state[node.name].term_1 = false;
                new_state[node.name].term_2 = false;
            }
            node.visited = false
        }
    }
}
