import bpy
import bmesh
import math
import os

def clear_scene():
    if bpy.ops.object.mode_set.poll():
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_material(name, color, roughness, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
    return mat

def create_box_mesh(name, width, height, depth, x, y, z, mat=None, pivot_mode='center'):
    mesh = bpy.data.meshes.new(name + "_mesh")
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    
    bm = bmesh.new()
    w_half = width / 2.0
    h_half = height / 2.0
    d_half = depth / 2.0
    
    if pivot_mode == 'center':
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=(width, depth, height), verts=bm.verts)
    elif pivot_mode == 'hinge_l':
        for v in [
            (0, 0, 0), (width, 0, 0), (width, depth, 0), (0, depth, 0),
            (0, 0, height), (width, 0, height), (width, depth, height), (0, depth, height)
        ]:
            bm.verts.new(v)
        bm.verts.ensure_lookup_table()
        faces = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]]
        for f in faces:
            bm.faces.new([bm.verts[i] for i in f])
    elif pivot_mode == 'hinge_r':
        for v in [
            (-width, 0, 0), (0, 0, 0), (0, depth, 0), (-width, depth, 0),
            (-width, 0, height), (0, 0, height), (0, depth, height), (-width, depth, height)
        ]:
            bm.verts.new(v)
        bm.verts.ensure_lookup_table()
        faces = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]]
        for f in faces:
            bm.faces.new([bm.verts[i] for i in f])
    elif pivot_mode == 'drawer':
        for v in [
            (-w_half, 0, 0), (w_half, 0, 0), (w_half, depth, 0), (-w_half, depth, 0),
            (-w_half, 0, height), (w_half, 0, height), (w_half, depth, height), (-w_half, depth, height)
        ]:
            bm.verts.new(v)
        bm.verts.ensure_lookup_table()
        faces = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]]
        for f in faces:
            bm.faces.new([bm.verts[i] for i in f])
    elif pivot_mode == 'hinge_bottom':
        for v in [
            (-w_half, -depth, 0), (w_half, -depth, 0), (w_half, 0, 0), (-w_half, 0, 0),
            (-w_half, -depth, height), (w_half, -depth, height), (w_half, 0, height), (-w_half, 0, height)
        ]:
            bm.verts.new(v)
        bm.verts.ensure_lookup_table()
        faces = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]]
        for f in faces:
            bm.faces.new([bm.verts[i] for i in f])
            
    bm.to_mesh(mesh)
    bm.free()
    
    if mat:
        obj.data.materials.append(mat)
        
    obj.location = (x, y, z)
    return obj

def create_hollow_cabinet(name, width, height, depth, x, y, z, mat_frame, mat_back, thickness=0.018, open_top=False):
    create_box_mesh(name + "_wall_l", thickness, height, depth, x - width/2 + thickness/2, y, z, mat_frame)
    create_box_mesh(name + "_wall_r", thickness, height, depth, x + width/2 - thickness/2, y, z, mat_frame)
    create_box_mesh(name + "_bottom", width - 2*thickness, thickness, depth, x, y, z - height/2 + thickness/2, mat_frame)
    if not open_top:
        create_box_mesh(name + "_top", width - 2*thickness, thickness, depth, x, y, z + height/2 - thickness/2, mat_frame)
    create_box_mesh(name + "_back", width - 2*thickness, height, thickness, x, y + depth/2 - thickness/2, z, mat_back)

def create_drawer_with_box(name, width, height, thickness, x, y, z, mat_facade, mat_box, drawer_depth=0.48, drawer_box_h=0.15):
    create_box_mesh(name, width, height, thickness, x, y, z, mat_facade, pivot_mode='drawer')
    box_w = width - 0.06
    wall_z = z + 0.10
    create_box_mesh(name + "_box_l", 0.012, drawer_box_h, drawer_depth, x - width/2 + 0.03, y + drawer_depth/2 + thickness, wall_z, mat_box)
    create_box_mesh(name + "_box_r", 0.012, drawer_box_h, drawer_depth, x + width/2 - 0.03, y + drawer_depth/2 + thickness, wall_z, mat_box)
    create_box_mesh(name + "_box_back", box_w - 0.024, drawer_box_h, 0.012, x, y + drawer_depth + thickness - 0.006, wall_z, mat_box)
    create_box_mesh(name + "_box_bottom", box_w, 0.006, drawer_depth, x, y + drawer_depth/2 + thickness, z + 0.02, mat_box)

def build_assembly_perfect():
    clear_scene()
    
    # Materials
    mat_carcass = create_material("mat_carcass", (0.12, 0.12, 0.12, 1.0), 0.35)
    mat_shelf = create_material("mat_shelf", (0.28, 0.28, 0.28, 1.0), 0.4)
    mat_facade = create_material("mat_facade", (0.8, 0.15, 0.15, 1.0), 0.1)
    mat_countertop = create_material("mat_countertop", (0.92, 0.92, 0.92, 1.0), 0.08)
    mat_backsplash = create_material("mat_backsplash", (0.04, 0.04, 0.04, 1.0), 0.6)
    mat_appliances = create_material("mat_appliances", (0.01, 0.01, 0.01, 1.0), 0.12, metallic=0.95)
    mat_oven_inner = create_material("mat_oven_inner", (0.05, 0.05, 0.05, 1.0), 0.6)
    mat_chrome = create_material("mat_chrome", (0.8, 0.8, 0.8, 1.0), 0.05, metallic=0.95)
    
    cab_w = 0.8
    cab_h = 0.72
    cab_d = 0.56
    plinth_h = 0.1
    
    # --- 1. FRAMES (Layer_1_Frame_*) with shelves inside ---
    create_box_mesh("Layer_1_Frame_Plinth", cab_w * 3, plinth_h, cab_d - 0.02, 0, 0, plinth_h / 2, mat_carcass)
    
    # Cabinet 1 (Left)
    create_hollow_cabinet("Layer_1_Frame_Cabinet_Lower_1", cab_w, cab_h, cab_d, -cab_w, 0, plinth_h + cab_h / 2, mat_carcass, mat_carcass)
    create_box_mesh("Layer_1_Frame_Shelf_Lower_1_A", cab_w - 0.04, 0.02, cab_d - 0.04, -cab_w, 0, plinth_h + 0.24, mat_shelf)
    create_box_mesh("Layer_1_Frame_Shelf_Lower_1_B", cab_w - 0.04, 0.02, cab_d - 0.04, -cab_w, 0, plinth_h + 0.48, mat_shelf)
    
    # Cabinet 2 (Middle)
    create_hollow_cabinet("Layer_1_Frame_Cabinet_Lower_2", cab_w, cab_h, cab_d, 0, 0, plinth_h + cab_h / 2, mat_carcass, mat_carcass)
    create_box_mesh("Layer_1_Frame_Shelf_Lower_2_Divider", cab_w - 0.04, 0.02, cab_d - 0.04, 0, 0, plinth_h + cab_h / 2, mat_shelf)
    
    # Cabinet 3 (Right)
    create_hollow_cabinet("Layer_1_Frame_Cabinet_Lower_3", cab_w, cab_h, cab_d, cab_w, 0, plinth_h + cab_h / 2, mat_carcass, mat_carcass)
    
    # Upper cabinets
    upper_w = 0.9
    upper_h = 0.72
    upper_d = 0.32
    upper_y = 0.12 # Aligned so that back of cabinet Y = 0.12 + 0.16 = 0.28 (flush with lower cabinets/backsplash)
    upper_z = plinth_h + cab_h + 0.6 + upper_h / 2
    
    create_hollow_cabinet("Layer_1_Frame_Cabinet_Upper_1", upper_w, upper_h, upper_d, -upper_w / 2 - 0.1, upper_y, upper_z, mat_carcass, mat_carcass)
    create_box_mesh("Layer_1_Frame_Shelf_Upper_1_A", upper_w - 0.04, 0.02, upper_d - 0.04, -upper_w / 2 - 0.1, upper_y, upper_z - 0.18, mat_shelf)
    create_box_mesh("Layer_1_Frame_Shelf_Upper_1_B", upper_w - 0.04, 0.02, upper_d - 0.04, -upper_w / 2 - 0.1, upper_y, upper_z + 0.18, mat_shelf)
    
    create_hollow_cabinet("Layer_1_Frame_Cabinet_Upper_2", upper_w, upper_h, upper_d, upper_w / 2 + 0.1, upper_y, upper_z, mat_carcass, mat_carcass)
    create_box_mesh("Layer_1_Frame_Shelf_Upper_2_A", upper_w - 0.04, 0.02, upper_d - 0.04, upper_w / 2 + 0.1, upper_y, upper_z - 0.18, mat_shelf)
    create_box_mesh("Layer_1_Frame_Shelf_Upper_2_B", upper_w - 0.04, 0.02, upper_d - 0.04, upper_w / 2 + 0.1, upper_y, upper_z + 0.18, mat_shelf)
    
    # --- 2. COUNTERTOP & BACKSPLASH (Layer_2_Countertop_*) ---
    countertop_thickness = 0.04
    ct_z = plinth_h + cab_h + countertop_thickness / 2
    create_box_mesh("Layer_2_Countertop_Main", cab_w * 3 + 0.02, countertop_thickness, cab_d + 0.02, 0, -0.01, ct_z, mat_countertop)
    create_box_mesh("Layer_2_Countertop_Sink", 0.45, 0.01, 0.4, -cab_w, -0.01, ct_z + 0.021, mat_appliances)
    create_box_mesh("Layer_2_Countertop_Backsplash", cab_w * 3, 0.6, 0.02, 0, cab_d / 2 - 0.01, plinth_h + cab_h + 0.3, mat_backsplash)
    
    # --- 3. APPLIANCES (Layer_3_Appliances_*) ---
    # Hollow Oven Body
    oven_w, oven_h, oven_d = cab_w - 0.04, cab_h - 0.04, cab_d - 0.04
    oven_x, oven_y, oven_z = cab_w, -0.01, plinth_h + cab_h / 2
    create_box_mesh("Layer_3_Appliances_Oven_Cavity_Wall_L", 0.02, oven_h, oven_d, oven_x - oven_w/2 + 0.01, oven_y, oven_z, mat_oven_inner)
    create_box_mesh("Layer_3_Appliances_Oven_Cavity_Wall_R", 0.02, oven_h, oven_d, oven_x + oven_w/2 - 0.01, oven_y, oven_z, mat_oven_inner)
    create_box_mesh("Layer_3_Appliances_Oven_Cavity_Bottom", oven_w - 0.04, 0.02, oven_d, oven_x, oven_y, oven_z - oven_h/2 + 0.01, mat_oven_inner)
    create_box_mesh("Layer_3_Appliances_Oven_Cavity_Top", oven_w - 0.04, 0.02, oven_d, oven_x, oven_y, oven_z + oven_h/2 - 0.01, mat_oven_inner)
    create_box_mesh("Layer_3_Appliances_Oven_Cavity_Back", oven_w - 0.04, oven_h - 0.04, 0.02, oven_x, oven_y + oven_d/2 - 0.01, oven_z, mat_oven_inner)
    
    # Chrome metal rack inside oven
    create_box_mesh("Layer_3_Appliances_Oven_Grid_1", oven_w - 0.08, 0.01, oven_d - 0.08, oven_x, oven_y - 0.02, oven_z - 0.06, mat_chrome)
    create_box_mesh("Layer_3_Appliances_Oven_Grid_2", oven_w - 0.08, 0.01, oven_d - 0.08, oven_x, oven_y - 0.02, oven_z + 0.08, mat_chrome)
    
    # Cooktop
    create_box_mesh("Layer_3_Appliances_Cooktop", 0.6, 0.01, 0.5, cab_w, -0.01, ct_z + countertop_thickness / 2 + 0.006, mat_appliances)
                    
    # --- 4. FACADES (Layer_4_Facades_*) ---
    door_thick = 0.02
    door_gap = 0.002
    
    # Lower cabinet doors
    create_box_mesh("Layer_4_Facades_Door_Lower_1", cab_w / 2 - door_gap, cab_h - door_gap, door_thick,
                    -cab_w - cab_w / 2, -cab_d / 2 - door_thick, plinth_h, mat_facade, pivot_mode='hinge_l')
    create_box_mesh("Layer_4_Facades_Door_Lower_2", cab_w / 2 - door_gap, cab_h - door_gap, door_thick,
                    -cab_w + cab_w / 2, -cab_d / 2 - door_thick, plinth_h, mat_facade, pivot_mode='hinge_r')
                    
    # Drawers (Facade + Full Box Panels)
    create_drawer_with_box("Layer_4_Facades_Drawer_1", cab_w - door_gap, cab_h / 2 - door_gap, door_thick,
                           0, -cab_d / 2 - door_thick, plinth_h + cab_h / 2, mat_facade, mat_shelf)
    create_drawer_with_box("Layer_4_Facades_Drawer_2", cab_w - door_gap, cab_h / 2 - door_gap, door_thick,
                           0, -cab_d / 2 - door_thick, plinth_h, mat_facade, mat_shelf)
                    
    # Oven Door
    create_box_mesh("Layer_4_Facades_Door_Oven", cab_w - 0.04, cab_h - 0.04, door_thick,
                    cab_w, -cab_d / 2 - door_thick, plinth_h + 0.02, mat_appliances, pivot_mode='hinge_bottom')
                    
    # Upper cabinet doors
    create_box_mesh("Layer_4_Facades_Door_Upper_1", upper_w / 2 - door_gap, upper_h - door_gap, door_thick,
                    -upper_w / 2 - 0.1 - upper_w / 2, upper_y - upper_d / 2 - door_thick, upper_z - upper_h / 2, mat_facade, pivot_mode='hinge_l')
    create_box_mesh("Layer_4_Facades_Door_Upper_2", upper_w / 2 - door_gap, upper_h - door_gap, door_thick,
                    -upper_w / 2 - 0.1 + upper_w / 2, upper_y - upper_d / 2 - door_thick, upper_z - upper_h / 2, mat_facade, pivot_mode='hinge_r')
                    
    create_box_mesh("Layer_4_Facades_Door_Upper_3", upper_w / 2 - door_gap, upper_h - door_gap, door_thick,
                    upper_w / 2 + 0.1 - upper_w / 2, upper_y - upper_d / 2 - door_thick, upper_z - upper_h / 2, mat_facade, pivot_mode='hinge_l')
    create_box_mesh("Layer_4_Facades_Door_Upper_4", upper_w / 2 - door_gap, upper_h - door_gap, door_thick,
                    upper_w / 2 + 0.1 + upper_w / 2, upper_y - upper_d / 2 - door_thick, upper_z - upper_h / 2, mat_facade, pivot_mode='hinge_r')
                    
    glb_path = r"C:\Users\user\.gemini\antigravity\scratch\kitchen-app\public\models\kitchen_perfect.glb"
    
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB'
    )
    print(f"Exported successfully to {glb_path}")

build_assembly_perfect()
