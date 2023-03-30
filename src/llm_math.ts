import { LLMChain, PromptTemplate } from "langchain";
import { BaseLanguageModel } from "langchain/base_language";
import { BaseChain } from "langchain/chains";
import { ChainValues } from "langchain/schema";
import { execSync } from 'child_process'

const _PROMPT_TEMPLATE = `You are GPT-3, and you can't do math.
You can do basic math, and your memorization abilities are impressive, but you can't do any complex calculations that a human could not do in their head. You also have an annoying tendency to just make up highly specific, but wrong, answers.
So we hooked you up to a javascript kernel, and now you can execute code. If you execute code, you must print out the final answer using the print function. You MUST use the javascript builtin Math object to answer your question.
Question: <Question with math problem.>
\`\`\`javascript
<Code that solves the problem and prints the solution>
\`\`\`
\`\`\`output
<Output of running the code>
\`\`\`
Answer: <Answer>
Begin.
Question: What is 37593 * 67?
\`\`\`javascript
console.log(37593 * 67)
\`\`\`
\`\`\`output
2518731
\`\`\`
Answer: 2518731
Question: {question}
`

const DEFAULT_MATH_PROMPT = new PromptTemplate({
    template: _PROMPT_TEMPLATE,
    inputVariables: ["question"],
})


export class LlmMathChain extends BaseChain {
    llm: BaseLanguageModel;

    prompt = DEFAULT_MATH_PROMPT;

    verbose: boolean = true;

    outputKey = "result";

    inputKey = "question";


    get inputKeys() {
        return ["question"];
    }

    constructor(fields: {
        llm: BaseLanguageModel;
      }) {
        super();
        this.llm = fields.llm
    }

    _chainType(): string {
        return "llm_math_chain";
    }

    async _call(values: ChainValues): Promise<ChainValues> {
        if (!(this.inputKey in values)) {
            throw new Error(`Document key ${this.inputKey} not found.`);
        }

        const llm_executor = new LLMChain({
            prompt: this.prompt,
            outputKey: this.outputKey,
            llm: this.llm,
        });

        const t = await llm_executor.predict({
            [this.inputKey]: values[this.inputKey],
            stop: "```output",
        });

        return this.processLlmResult(t);
    }

    processLlmResult(t: string) {
        t = t.trim();
        console.log('t:\n', t);
        const pattern = /```javascript([\s\S]*?)```/gm;
        const matches = t.match(pattern);
        
        let jsCode = matches?.[0];
        let output;
        if(jsCode) {
            jsCode = jsCode.trim().split('\n')[1];
            output = execSync('node -e "' + jsCode + '"').toString().trim();
        } else {
            throw new Error(`unknown format from LLM: ${t}}`)
        }

        return {
            [this.outputKey]: output,
        }

    }

    // @ts-ignore
    serialize()  {
        return {
            _type : this._chainType(),
            llm: this.llm.serialize(),
        }
    }

}