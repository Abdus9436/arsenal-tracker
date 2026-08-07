package com.jinx.arsenaltracker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    @Query("SELECT p FROM Player p ORDER BY " +
            "CASE p.position " +
            "WHEN 'Manager' THEN 0 " +
            "WHEN 'Goalkeeper' THEN 1 " +
            "WHEN 'Defender' THEN 2 " +
            "WHEN 'Midfielder' THEN 3 " +
            "WHEN 'Attacker' THEN 4 " +
            "ELSE 5 END, p.name ASC")
    List<Player> findAllByOrderByPositionAscNameAsc();
}