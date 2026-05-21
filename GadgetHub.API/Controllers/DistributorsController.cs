using Microsoft.AspNetCore.Mvc;
using GadgetHub.API.Models;
using GadgetHub.API.Services;

namespace GadgetHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistributorsController : ControllerBase
    {
        private readonly IDistributorService _distributorService;

        public DistributorsController(IDistributorService distributorService)
        {
            _distributorService = distributorService;
        }

        // GET: api/distributors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Distributor>>> GetAllDistributors()
        {
            try
            {
                var distributors = await _distributorService.GetAllDistributorsAsync();
                return Ok(distributors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/distributors/active
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<Distributor>>> GetActiveDistributors()
        {
            try
            {
                var distributors = await _distributorService.GetActiveDistributorsAsync();
                return Ok(distributors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/distributors/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Distributor>> GetDistributor(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest("Distributor ID is required");

                var distributor = await _distributorService.GetDistributorByIdAsync(id);
                if (distributor == null)
                    return NotFound($"Distributor with ID {id} not found");

                return Ok(distributor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/distributors/type/{type}
        [HttpGet("type/{type}")]
        public async Task<ActionResult<Distributor>> GetDistributorByType(string type)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(type))
                    return BadRequest("Distributor type is required");

                // Validate type is one of the 3 allowed values
                var validTypes = new[] { "TechWorld", "ElectroCom", "GadgetCentral" };
                if (!validTypes.Contains(type))
                    return BadRequest($"Invalid distributor type. Must be one of: {string.Join(", ", validTypes)}");

                var distributor = await _distributorService.GetDistributorByTypeAsync(type);
                if (distributor == null)
                    return NotFound($"Distributor with type {type} not found");

                return Ok(distributor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/distributors
        [HttpPost]
        public async Task<ActionResult<Distributor>> CreateDistributor([FromBody] Distributor distributor)
        {
            try
            {
                if (distributor == null)
                    return BadRequest("Distributor data is required");

                if (string.IsNullOrWhiteSpace(distributor.Name))
                    return BadRequest("Distributor name is required");

                if (string.IsNullOrWhiteSpace(distributor.Type))
                    return BadRequest("Distributor type is required");

                // Validate type is one of the 3 allowed values
                var validTypes = new[] { "TechWorld", "ElectroCom", "GadgetCentral" };
                if (!validTypes.Contains(distributor.Type))
                    return BadRequest($"Invalid distributor type. Must be one of: {string.Join(", ", validTypes)}");

                // Check if distributor type already exists
                var existingDistributor = await _distributorService.GetDistributorByTypeAsync(distributor.Type);
                if (existingDistributor != null)
                    return Conflict($"Distributor with type {distributor.Type} already exists");

                var createdDistributor = await _distributorService.CreateDistributorAsync(distributor);
                return CreatedAtAction(nameof(GetDistributor), new { id = createdDistributor.Id }, createdDistributor);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/distributors/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDistributor(string id, [FromBody] Distributor distributor)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest("Distributor ID is required");

                if (distributor == null)
                    return BadRequest("Distributor data is required");

                if (id != distributor.Id)
                    return BadRequest("Distributor ID mismatch");

                // Check if distributor exists without tracking it
                var existingDistributor = await _distributorService.GetDistributorByIdAsync(id);
                if (existingDistributor == null)
                    return NotFound($"Distributor with ID {id} not found");

                // Update the distributor directly without additional tracking
                await _distributorService.UpdateDistributorAsync(distributor);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/distributors/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDistributor(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest("Distributor ID is required");

                var existingDistributor = await _distributorService.GetDistributorByIdAsync(id);
                if (existingDistributor == null)
                    return NotFound($"Distributor with ID {id} not found");

                await _distributorService.DeleteDistributorAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 