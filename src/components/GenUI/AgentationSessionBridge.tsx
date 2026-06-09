import { useMutation } from "convex/react";
import type { Annotation, AgentationProps } from "agentation";
import type { ComponentType } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
	AGENTATION_MCP_ENDPOINT,
	buildAgentationSessionKey,
} from "#/lib/agentation-session";

interface AgentationSessionBridgeProps {
	enabled: boolean;
	sessionId: string;
}

const AgentationSessionBridge = ({
	enabled,
	sessionId,
}: AgentationSessionBridgeProps) => {
	const [AgentationComponent, setAgentationComponent] =
		useState<ComponentType<AgentationProps> | null>(null);
	const saveSession = useMutation(api.agentation.saveSession);
	const upsertAnnotation = useMutation(api.agentation.upsertAnnotation);
	const deleteAnnotation = useMutation(api.agentation.deleteAnnotation);
	const clearAnnotations = useMutation(api.agentation.clearAnnotations);
	const convexSessionId = sessionId as Id<"sessions">;
	const agentationSessionId = useMemo(
		() => buildAgentationSessionKey(sessionId),
		[sessionId],
	);

	useEffect(() => {
		if (!enabled || AgentationComponent || typeof window === "undefined") return;

		let cancelled = false;
		void import("agentation").then(({ Agentation }) => {
			if (!cancelled) {
				setAgentationComponent(() => Agentation);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [AgentationComponent, enabled]);

	useEffect(() => {
		if (!enabled) return;

		void saveSession({
			sessionId: convexSessionId,
			agentationSessionId,
		}).catch((error) => {
			console.error("[Agentation] Failed to save session:", error);
		});
	}, [agentationSessionId, convexSessionId, enabled, saveSession]);

	const handleUpsertAnnotation = useCallback(
		(annotation: Annotation) => {
			void upsertAnnotation({
				sessionId: convexSessionId,
				annotation,
			}).catch((error) => {
				console.error("[Agentation] Failed to persist annotation:", error);
			});
		},
		[convexSessionId, upsertAnnotation],
	);

	const handleDeleteAnnotation = useCallback(
		(annotation: Annotation) => {
			void deleteAnnotation({
				sessionId: convexSessionId,
				annotationId: annotation.id,
			}).catch((error) => {
				console.error("[Agentation] Failed to delete annotation:", error);
			});
		},
		[convexSessionId, deleteAnnotation],
	);

	const handleClearAnnotations = useCallback(() => {
		void clearAnnotations({ sessionId: convexSessionId }).catch((error) => {
			console.error("[Agentation] Failed to clear annotations:", error);
		});
	}, [clearAnnotations, convexSessionId]);

	if (!enabled || !AgentationComponent) return null;

	return (
		<AgentationComponent
			sessionId={agentationSessionId}
			endpoint={AGENTATION_MCP_ENDPOINT}
			copyToClipboard={true}
			onSessionCreated={(createdSessionId) => {
				void saveSession({
					sessionId: convexSessionId,
					agentationSessionId: createdSessionId,
				}).catch((error) => {
					console.error("[Agentation] Failed to save created session:", error);
				});
			}}
			onAnnotationAdd={handleUpsertAnnotation}
			onAnnotationUpdate={handleUpsertAnnotation}
			onAnnotationDelete={handleDeleteAnnotation}
			onAnnotationsClear={handleClearAnnotations}
		/>
	);
};

export default AgentationSessionBridge;
