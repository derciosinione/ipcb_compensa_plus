import time
import logging
from typing import Any, Dict, List, Optional
from app.services.openai_service import openai_service
from app.services.gemini_service import gemini_service
from app.services.cache_service import cache_service

logger = logging.getLogger(__name__)

class AI_Coordinator:
    def __init__(self):
        self.openai_disabled_until = 0

    async def create_thread(self, provider: str = "auto") -> str:
        if provider == "gemini" or time.time() < self.openai_disabled_until:
            return gemini_service.create_thread()
        
        try:
            return await openai_service.create_thread()
        except Exception as e:
            logger.warning(f"Failed to create OpenAI thread: {e}. Using Gemini.")
            return gemini_service.create_thread()

    async def upload_file(self, file_path: str, provider: str = "auto") -> str:
        if provider == "gemini" or time.time() < self.openai_disabled_until:
            return gemini_service.upload_file(file_path)
            
        try:
            return await openai_service.upload_file(file_path)
        except Exception as e:
            logger.warning(f"Failed to upload to OpenAI: {e}. Using Gemini.")
            return gemini_service.upload_file(file_path)

    async def send_message(self, thread_id: str, content: str, file_ids: Optional[List[str]] = None, user_context: Optional[Dict] = None) -> Dict[str, Any]:
        # Check if keys are configured
        from app.core.config import get_settings
        settings = get_settings()
        if not settings.OPENAI_API_KEY and not settings.GEMINI_API_KEY:
            return {
                "type": "text",
                "content": "⚠️ **Assistente de IA Não Configurado**\n\nNão foi detetada nenhuma chave de API para o **Gemini** ou **OpenAI** no seu ficheiro `.env`.\n\nPara ativar o Assistente de IA, por favor siga estes passos:\n\n1. Abra o ficheiro `.env` na raiz do projeto.\n2. Adicione a sua chave de API:\n   ```env\n   GEMINI_API_KEY=sua_chave_gemini_aqui\n   # ou\n   OPENAI_API_KEY=sua_chave_openai_aqui\n   ```\n3. Reinicie os contentores do Docker executando:\n   ```bash\n   docker compose up -d --build\n   ```\n\n*Nota: Se já configurou as chaves, certifique-se de que executou o comando acima para atualizar as variáveis de ambiente nos contentores.*"
            }

        # Try cache first (only for text-only requests without files for now to be safe)
        cache_key = None
        if not file_ids:
            cache_key = cache_service.generate_key(content, user_context)
            cached_response = await cache_service.get(cache_key)
            if cached_response:
                return cached_response

        # Split file IDs based on prefix if needed, or assume they belong to the current thread's provider
        openai_files = [f for f in file_ids if not f.startswith("file-gemini-")] if file_ids else []
        gemini_files = [f for f in file_ids if f.startswith("file-gemini-")] if file_ids else []
        
        # If no prefix, use them for the current provider
        if file_ids and not gemini_files and not openai_files:
            if thread_id.startswith("gemini_thread_"):
                gemini_files = file_ids
            else:
                openai_files = file_ids

        response = None
        # Attempt OpenAI
        if not thread_id.startswith("gemini_thread_") and time.time() > self.openai_disabled_until:
            try:
                response = await openai_service.send_message(thread_id, content, openai_files if openai_files else None, user_context)
                
                # Fallback if OpenAI returns an error of any kind
                if response.get("type") == "error":
                    logger.warning(f"OpenAI error detected: {response.get('content')}. Falling back to Gemini.")
                    self.openai_disabled_until = time.time() + (20 * 60)
                    response = await self._fallback_to_gemini(content, gemini_files, user_context)
            except Exception as e:
                logger.warning(f"OpenAI exception encountered: {str(e)}. Falling back to Gemini.")
                self.openai_disabled_until = time.time() + (20 * 60)
                response = await self._fallback_to_gemini(content, gemini_files, user_context)
        else:
            response = await gemini_service.send_message(thread_id, content, gemini_files, user_context)

        # Store in cache if successful
        if cache_key and response and response.get("type") != "error":
            # Don't cache error responses
            await cache_service.set(cache_key, response)

        return response

    async def _fallback_to_gemini(self, content: str, file_ids: List[str], user_context: Optional[Dict]) -> Dict[str, Any]:
        new_thread = gemini_service.create_thread()
        response = await gemini_service.send_message(new_thread, content, file_ids, user_context)
        response["thread_id"] = new_thread
        return response

    async def delete_thread(self, thread_id: str) -> bool:
        if thread_id.startswith("gemini_thread_"):
            return await gemini_service.delete_thread(thread_id)
        else:
            return await openai_service.delete_thread(thread_id)

ai_coordinator = AI_Coordinator()
