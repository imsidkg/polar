from pathlib import Path

from fastapi import Depends, FastAPI, Request
from starlette.staticfiles import StaticFiles
from tagflow import tag, text

from .accounts.endpoints import router as accounts_router
from .dependencies import get_admin
from .external_events.endpoints import router as external_events_router
from .layout import layout
from .middlewares import SecurityHeadersMiddleware, TagflowMiddleware
from .organizations.endpoints import router as organizations_router
from .pledges.endpoints import router as pledges_router
from .responses import TagResponse
from .tasks.endpoints import router as tasks_router
from .users.endpoints import router as users_router

app = FastAPI(
    default_response_class=TagResponse,
    dependencies=[Depends(get_admin)],
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(TagflowMiddleware)


app.mount(
    "/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static"
)
app.include_router(users_router, prefix="/users")
app.include_router(organizations_router, prefix="/organizations")
app.include_router(accounts_router, prefix="/accounts")
app.include_router(external_events_router, prefix="/external-events")
app.include_router(tasks_router, prefix="/tasks")
app.include_router(pledges_router, prefix="/pledges")


@app.get("/", name="index")
async def index(request: Request) -> None:
    with layout(request, [], "index"):
        with tag.h1():
            text("Dashboard")


__all__ = ["app"]
