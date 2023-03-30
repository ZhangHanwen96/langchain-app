import { BaseChain, LLMChain } from "langchain/chains";
import { BaseLanguageModel } from "langchain/base_language";
import { DEFAULT_BASH_PROMPT } from "./bash_prompt";
import { ChainValues } from "langchain/schema";
import { execSync } from 'child_process';

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
      console.log('\x1b[34m%s\x1b[0m', output)
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

    outputKey = "result";

    inputKey = "question";

    get inputKeys() {
        return [this.inputKey];
    }

    constructor(fields: {
        llm: BaseLanguageModel;
        inputKey?: string;
        outputKey?: string;
      }) {
        super();
        this.llm = fields.llm
        this.inputKey = fields.inputKey ?? this.inputKey;
        this.outputKey = fields.outputKey ?? this.outputKey;
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

        console.log('\x1b[32m%s\x1b[0m', t);

        t.trim();
        const pattern = /```bash([\s\S]*?)```/gm;
        const m = t.match(pattern);

        let matchedBash = m?.[0];
        let output;
        if(matchedBash) {
            let commandList = matchedBash.split('\n');
            commandList = commandList.slice(1, commandList.length - 1);
            //  Remove the first and last substrings
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

    // static deserialize(fields: {
    //   data: Record<string, any>,
    //   values: Record<string, any>,
    // }) {
    //   const {_type, llm} = data;
    // }
}
