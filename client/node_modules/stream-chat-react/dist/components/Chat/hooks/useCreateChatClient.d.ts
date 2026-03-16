import { StreamChat } from 'stream-chat';
import type { DefaultGenerics, ExtendableGenerics, OwnUserResponse, StreamChatOptions, TokenOrProvider, UserResponse } from 'stream-chat';
/**
 * React hook to create, connect and return `StreamChat` client.
 */
export declare const useCreateChatClient: <SCG extends ExtendableGenerics = DefaultGenerics>({ apiKey, options, tokenOrProvider, userData, }: {
    apiKey: string;
    tokenOrProvider: TokenOrProvider;
    userData: OwnUserResponse<SCG> | UserResponse<SCG>;
    options?: StreamChatOptions;
}) => StreamChat<SCG> | null;
