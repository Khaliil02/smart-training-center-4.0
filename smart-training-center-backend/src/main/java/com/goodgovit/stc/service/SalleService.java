package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.CapteurIoTDto;
import com.goodgovit.stc.dto.SalleDto;
import com.goodgovit.stc.dto.SalleRequest;
import com.goodgovit.stc.entity.Salle;
import com.goodgovit.stc.entity.enums.TypeSalle;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.SalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalleService {

    private final SalleRepository salleRepository;
    private final CapteurService capteurService;

    @Transactional(readOnly = true)
    public List<SalleDto> getAllSalles() {
        return salleRepository.findAll().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalleDto getSalleById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public SalleDto createSalle(SalleRequest request) {
        Salle salle = Salle.builder()
                .nomSalle(request.getNomSalle())
                .capacite(request.getCapacite())
                .type(TypeSalle.valueOf(request.getType()))
                .build();
        return toDto(salleRepository.save(salle));
    }

    @Transactional
    public SalleDto updateSalle(Long id, SalleRequest request) {
        Salle salle = findOrThrow(id);
        salle.setNomSalle(request.getNomSalle());
        salle.setCapacite(request.getCapacite());
        salle.setType(TypeSalle.valueOf(request.getType()));
        return toDto(salleRepository.save(salle));
    }

    @Transactional
    public void deleteSalle(Long id) {
        Salle salle = findOrThrow(id);
        salleRepository.delete(salle);
    }

    private Salle findOrThrow(Long id) {
        return salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + id));
    }

    private SalleDto toDto(Salle s) {
        List<CapteurIoTDto> capteurs = capteurService.getCapteursBySalle(s.getId());
        return SalleDto.builder()
                .id(s.getId())
                .nomSalle(s.getNomSalle())
                .capacite(s.getCapacite())
                .type(s.getType().name())
                .capteurs(capteurs)
                .build();
    }
}
