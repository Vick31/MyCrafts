using Microsoft.AspNetCore.Mvc;
using MyCrafts.Models;
using MyCrafts.Services;

namespace MyCrafts.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ManualidadesController : ControllerBase
{
    private readonly ManualidadService _service;

    public ManualidadesController(ManualidadService service)
    {
        _service = service;
    }

    [HttpPost("Guardar")]
    public IActionResult Guardar([FromBody] ManualidadRequest request)
    {
        try
        {
            string ok = _service.Guardar(request);

            if (ok != "si")
            {
                return BadRequest(ok);
            }

            return Ok("Guardado correctamente.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}