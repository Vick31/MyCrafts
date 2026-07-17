using MyCrafts.Services;

var builder = WebApplication.CreateBuilder(args);

// Registrar Controllers
builder.Services.AddControllers();

// Registrar dependencias
builder.Services.AddScoped<ManualidadService>();

var app = builder.Build();

app.UseHttpsRedirection();

// Para servir index.html autom�ticamente
app.UseDefaultFiles();

// Para servir CSS, JS e im�genes
app.UseStaticFiles();

app.UseRouting();

// Mapear Controllers
app.MapControllers();

app.MapGet("/api/manualidades",

(ManualidadService servicio, int? cantidad) =>
{
    return Results.Ok(servicio.Obtener(cantidad));
});

app.Run();