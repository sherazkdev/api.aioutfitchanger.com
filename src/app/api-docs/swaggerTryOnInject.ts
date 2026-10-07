import { readTryOnImageFile, setTryOnSourceImageDataUrl } from "./tryOnSwaggerImage";

function isTryOnGeneratePostBlock(block: Element): boolean {
  const pathSpan = block.querySelector(".opblock-summary-path");
  const method = block.querySelector(".opblock-summary-method");
  if (!pathSpan?.textContent?.includes("/try-on/generate")) return false;
  return method?.textContent?.trim().toLowerCase() === "post";
}

function injectUploadIntoBlock(block: Element) {
  const body = block.querySelector(".opblock-body");
  if (!body || body.querySelector("[data-tryon-swagger-upload]")) return;

  const wrap = document.createElement("div");
  wrap.setAttribute("data-tryon-swagger-upload", "1");
  wrap.className = "tryon-swagger-upload";

  const label = document.createElement("label");
  label.className = "tryon-swagger-upload__label";
  label.textContent = "Person photo — file upload (base64 auto on Execute)";

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp,image/*";
  input.className = "tryon-swagger-upload__input";

  const status = document.createElement("p");
  status.className = "tryon-swagger-upload__status";
  status.textContent = "Image choose karo — Execute se pehle Ready dikhe.";

  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "tryon-swagger-upload__clear";
  clearBtn.textContent = "Clear image";
  clearBtn.hidden = true;

  wrap.append(label, input, status, clearBtn);

  const trySection =
    body.querySelector(".try-out") ?? body.querySelector(".opblock-section") ?? body.firstChild;
  if (trySection) body.insertBefore(wrap, trySection);
  else body.prepend(wrap);

  input.addEventListener("change", () => {
    void readTryOnImageFile(input.files?.[0]).then((r) => {
      if (r.ok) {
        status.textContent = `Ready: ${r.fileName} (${r.sizeKb} KB) — Execute dabao.`;
        status.classList.remove("tryon-swagger-upload__status--error");
        clearBtn.hidden = false;
      } else {
        status.textContent = r.error;
        status.classList.add("tryon-swagger-upload__status--error");
        clearBtn.hidden = true;
      }
    });
  });

  clearBtn.addEventListener("click", () => {
    setTryOnSourceImageDataUrl(null);
    input.value = "";
    status.textContent = "Image choose karo — Execute se pehle Ready dikhe.";
    status.classList.remove("tryon-swagger-upload__status--error");
    clearBtn.hidden = true;
  });
}

/** Mount file input inside Swagger POST /try-on/generate operation. */
export function mountTryOnSwaggerUploadInjector(root: HTMLElement): () => void {
  const inject = () => {
    root.querySelectorAll(".opblock").forEach((block) => {
      if (isTryOnGeneratePostBlock(block)) injectUploadIntoBlock(block);
    });
  };

  inject();
  const obs = new MutationObserver(() => inject());
  obs.observe(root, { childList: true, subtree: true });
  return () => obs.disconnect();
}
