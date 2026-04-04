import { ENV } from "./env";

export type Message = {
  role: "system" | "user" | "assistant" | "tool" | "function";
  content: string | Array<{ type: string; [key: string]: unknown }>;
};

export type InvokeParams = {
  messages: Message[];
  tools?: unknown[];
  toolChoice?: unknown;
  tool_choice?: unknown;
  outputSchema?: { name: string; schema: Record<string, unknown>; strict?: boolean };
  output_schema?: { name: string; schema: Record<string, unknown>; strict?: boolean };
  responseFormat?: unknown;
  response_format?: unknown;
};

export type InvokeResult = {
  choices: Array<{
    message: {
      role: string;
      content: string | Array<{ type: string; text?: string }>;
      tool_calls?: unknown[];
    };
    finish_reason: string;
  }>;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

function assertApiKey() {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Set it as an environment variable.");
  }
}

function resolveApiUrl(): string {
  return `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`;
}

function normalizeMessage(msg: Message): Record<string, unknown> {
  return { role: msg.role, content: msg.content };
}

function normalizeToolChoice(tc: unknown, tools?: unknown[]): unknown {
  if (!tc) return undefined;
  if (tc === "auto" || tc === "none" || tc === "required") return tc;
  if (typeof tc === "object" && tc !== null) return tc;
  return undefined;
}

function normalizeResponseFormat(params: {
  responseFormat?: unknown;
  response_format?: unknown;
  outputSchema?: { name: string; schema: Record<string, unknown>; strict?: boolean };
  output_schema?: { name: string; schema: Record<string, unknown>; strict?: boolean };
}): unknown {
  const rf = params.responseFormat || params.response_format;
  if (rf) return rf;
  const schema = params.outputSchema || params.output_schema;
  if (!schema) return undefined;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();
  const { messages, tools, toolChoice, tool_choice, outputSchema, output_schema, responseFormat, response_format } = params;

  const payload: Record<string, unknown> = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) payload.tools = tools;

  const ntc = normalizeToolChoice(toolChoice || tool_choice, tools);
  if (ntc) payload.tool_choice = ntc;

  payload.max_tokens = 32768;

  const nrf = normalizeResponseFormat({ responseFormat, response_format, outputSchema, output_schema });
  if (nrf) payload.response_format = nrf;

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.geminiApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }

  return (await response.json()) as InvokeResult;
}
