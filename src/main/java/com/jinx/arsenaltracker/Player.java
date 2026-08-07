package com.jinx.arsenaltracker;

import jakarta.persistence.*;

@Entity
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String position;
    private String number;
    private Integer age;
    private String height;

    @Column(columnDefinition = "TEXT")
    private String photo;

    public Player() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getHeight() { return height; }
    public void setHeight(String height) { this.height = height; }
    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }
}