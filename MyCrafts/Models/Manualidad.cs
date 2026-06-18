namespace MyCrafts.Models;

public class Manualidad
{
    public int Id { get; set; }
    public string Titulo { get; set; } = "";
    public string Categoria { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public string ImagenBase64 { get; set; } = "";
    public DateTime FechaCreacion { get; set; }
}