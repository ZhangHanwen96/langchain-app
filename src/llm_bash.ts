import { BaseChain, LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/base_language";
import { DEFAULT_BASH_PROMPT } from "./bash_prompt";
import { ChainValues } from "langchain/schema";
import { execSync } from 'child_process'

export class BashProcess {
    private stripNewlines: boolean;
  private returnErrOutput: boolean;

  /**
   * Executes bash commands and returns the output.
   * @param {boolean} stripNewlines - Whether to strip newlines from the output.
   * @param {boolean} returnErrOutput - Whether to return error output.
   */
  constructor(stripNewlines = false, returnErrOutput = false) {
    this.stripNewlines = stripNewlines;
    this.returnErrOutput = returnErrOutput;
  }

  /**
   * Runs commands and returns the final output.
   * @param {string|string[]} commands - The command(s) to execute.
   * @returns {string} - The output of the command(s).
   */
  run(commands) {
    if (!Array.isArray(commands)) {
      commands = [commands];
    }
    commands = commands.join(';');
    try {
      const output = execSync(commands).toString();
      if (this.stripNewlines) {
        return output.trim();
      }
      return output;
    } catch (error) {
      if (this.returnErrOutput) {
        return error.stdout.toString();
      }
      return error.toString();
    }
  }
}


export class LlmBashChain extends BaseChain {
    llm: BaseLanguageModel;

    prompt = DEFAULT_BASH_PROMPT;

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
        return "llm_bash_chain";
    }


    async _call(values: ChainValues): Promise<ChainValues> {
        if (!(this.inputKey in values)) {
            throw new Error(`Document key ${this.inputKey} not found.`);
        }
        const llm_executor = new LLMChain({
            prompt: this.prompt,
            outputKey: this.outputKey,
            llm: this.llm,
        })

        const bash_executor = new BashProcess();

        let t = await llm_executor.predict({
            question: values[this.inputKey]
        });

        t.trim();
        let output;
        console.info(t);
        if(t.startsWith("```bash")) {
            let commandList = t.split('\n');
            console.info(commandList);

            //  Remove the first and last substrings
            commandList = commandList.map((c) => c.substring(1, c.length - 1));
            
            output = bash_executor.run(commandList);
        } else {
            throw new Error(`unknown format from LLM: ${t}}`)
        }
        
        return {
            [this.outputKey]: output
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
